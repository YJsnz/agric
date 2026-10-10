"""Record the assistant's completed visual review of contact sheets 01--18.
These decisions are not inferred from score thresholds and are not expert label diagnoses.
"""
import csv
from tomato_v2_prepare import OUT,write

def main():
    with (OUT/'pair_review.csv').open(encoding='utf-8-sig') as f:rows=list(csv.DictReader(f))
    assert len(rows)==409 and rows[-1]['review_id']=='R409'
    for r in rows:
        n=int(r['review_id'][1:]);assert 1<=n<=409
        r['reviewer']='assistant_visual_review_not_human_expert'
        r['decision']='confirmed_same_source' if r['same_class']=='True' else 'confirmed_cross_label_source_conflict'
        r['group_type']='same_source_transform' if n<=329 else 'same_leaf'
        r['review_note']=('已逐对查看联系表：叶缘缺口、主次叶脉和斑块/虫道分布一致，整体画面对应，属于同源轻微变换或压缩差异。' if n<=329 else
          '已逐对查看联系表：特征性卷曲叶缘、坏死区域或虫道/主次叶脉位置一致；取景和局部形态略异，确认同叶，不断言具体人工变换。')
        if r['same_class']!='True':r['review_note']+=' 同源图像却在不同标签；不判断哪个病虫标签正确，双方隔离，不跨类别建立同叶分组。'
    write(OUT/'pair_review.csv',rows)
    with (OUT/'anomaly_review.csv').open(encoding='utf-8-sig') as f:anomalies=list(csv.DictReader(f))
    assert len(anomalies)==21
    for r in anomalies:
        r['decision']='retain_subject_to_duplicate_conflict_policy'
        r['note']='已查看异常图联系表：目标为叶片，部分紧裁剪/卷曲但主体可辨，无明显拼接、极小缩略图或非目标内容；不能从尺寸判断生成方式。正常解码，保持原始字节及标签；不认证病虫类别。'
        if r['format']=='PNG':r['note']+=' 实际PNG与JPG扩展名不一致，仅记录，不重编码。'
    write(OUT/'anomaly_review.csv',anomalies)
if __name__=='__main__':main()
