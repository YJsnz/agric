"""对证据关系逐条排序，不聚合为疾病概率，不丢弃原始候选。"""
from copy import deepcopy

from pear_diagnosis.context.context import PearDiagnosisContext

LOCAL_PRIORITY = {
    "泊头": 15, "泊头市": 15,
    "沧州": 10, "沧州市": 10,
    "河北": 5, "河北省": 5,
}
REVIEWED = {"source_checked", "local_expert_reviewed"}


class PearCandidateRanker:
    """人工规则分：叶片 +40，果实 -40，储藏 -25，异地 -15，待迁移 -20。

    泊头/沧州/河北证据优先级 +15/+10/+5，仅在用户明确提供当地上下文
    且证据已审核时启用。该优先级不是地区适用性判定或证据质量等级。
    同分保留检索顺序。部位仅匹配症状名称，不从疾病名猜测部位。
    """

    def rank(self, candidates: list[dict], context: PearDiagnosisContext) -> list[dict]:
        ranked = []
        for candidate in candidates:
            item = deepcopy(candidate)
            score = 0
            reasons = []
            warnings = []
            symptom = item.get("symptom_name") or ""
            if context.organ in {"leaf", "叶", "叶片"}:
                if any(term in symptom for term in ("叶片", "叶面", "叶斑", "叶脉", "叶缘", "卷叶")):
                    score += 40
                    reasons.append("+40：症状名称明确涉及叶片，与 organ=leaf 一致")
                if any(term in symptom for term in ("果实", "果面", "果皮", "果肉", "果心")):
                    score -= 40
                    reasons.append("-40：症状名称明确涉及果实部位，与叶片输入不符")
                    warnings.append("果实症状不能直接解释当前叶片观测，保留候选供追溯")
                if any(term in symptom for term in ("储藏", "贮藏", "采后", "冷藏")):
                    score -= 25
                    reasons.append("-25：症状名称明确涉及储藏/采后，与当前叶片检索不直接对应")
                    warnings.append("储藏症状需要另行核对场景，不能据此推断用户处于储藏阶段")
                if not reasons:
                    warnings.append("症状名称未明确部位，不能推断为叶片症状")
            elif context.organ is None:
                warnings.append("organ 缺失，未进行部位加权")
            else:
                warnings.append("第一版仅实现叶片部位规则，当前部位未加权")

            region = item.get("region")
            review = item.get("review_status")
            foreign = isinstance(region, str) and region.startswith(("US-", "AU-"))
            if foreign:
                score -= 15
                reasons.append(f"-15：{region} 为异地证据，不作为泊头/沧州/河北本地证据")
                warnings.append(f"异地证据 {region} 的本地适用性需要审核")
            elif region in LOCAL_PRIORITY:
                if context.region in LOCAL_PRIORITY and review in REVIEWED:
                    bonus = LOCAL_PRIORITY[region]
                    score += bonus
                    reasons.append(f"+{bonus}：{region} 已审核证据，按泊头/沧州/河北优先级排序")
                    warnings.append("地区优先级不代表该证据已适用于当前地块")
                else:
                    warnings.append("本地地区证据未加分：需明确本地上下文及已审核状态")
            else:
                warnings.append("证据地区未纳入本地优先规则，未认定为本地适用")
            if context.region is None:
                warnings.append("用户地区缺失，未推断为泊头/沧州/河北")
            if review == "transfer_pending":
                score -= 20
                reasons.append("-20：transfer_pending，迁移适用性尚待审核")
                warnings.append("transfer_pending：不得视为已审核的本地证据")
            elif review not in REVIEWED:
                warnings.append(f"审核状态 {review!r} 未确认为已审核")
            warnings.append("第一版未对作物、场景、生育期和气象数值评分；缺失信息保持 None")
            warnings.append("ranking_score 仅为规则排序分，不是疾病概率或确诊概率")
            item.update(ranking_score=score, ranking_reasons=reasons, ranking_warnings=warnings)
            ranked.append(item)
        return sorted(ranked, key=lambda item: item["ranking_score"], reverse=True)
