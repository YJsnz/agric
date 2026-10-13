"""Read-only evidence scope overlay. A scope tier is not a disease probability.

Original documents, review_status, regions and KG relations are never rewritten.
Only explicitly reviewed chunk fingerprints can enter generic explanation mode.
"""
import hashlib
import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'data/botou_yali/evidence/metadata/evidence_scope_review.json'


@lru_cache(maxsize=1)
def registry():
    return json.loads(REGISTRY.read_text(encoding='utf-8'))


def classify(record, kind='source'):
    """Return independent geographic, availability and organ restrictions."""
    sid = record.get('source_id', record.get('id', ''))
    review = registry()['sources'].get(sid, {}) if kind != 'relation' else {}
    status = review.get('status', 'authority_pending')
    reasons = list(review.get('reasons', []))
    region = record.get('region') or []
    region = [region] if isinstance(region, str) else region
    if kind == 'relation':
        if record.get('review_status') == 'transfer_pending' or any(r.startswith(('US-', 'AU-')) for r in region):
            status = 'transfer_pending'
        elif record.get('review_status') in ('source_checked', 'local_expert_reviewed') and record.get('evidence_level') in ('A', 'B', 'C'):
            status = ('local_verified' if set(region) & {'泊头市', '沧州市'} else
                      'hebei_verified' if '河北省' in region else
                      'general_authoritative' if not region or region == ['全国'] else 'transfer_pending')
        reasons.append('继承已有关系审核和明确地区；分级不新增或验证因果关系')
    flags = list(review.get('restrictions', []))
    if kind == 'relation':
        linked = [registry()['sources'].get(s, {}) for s in record.get('evidence_ids', [])]
        for restriction in ('postharvest_only', 'fulltext_required'):
            if linked and all(restriction in s.get('restrictions', []) for s in linked):
                flags.append(restriction)
    if record.get('availability') == 'summary_only':
        flags.append('fulltext_required')
    if record.get('extraction_status') == 'needs_ocr':
        flags.append('text_extraction_required')
    if kind == 'chunk':
        fingerprint = hashlib.sha256(record.get('text', '').encode('utf-8')).hexdigest()
        approved = registry()['chunks'].get(record.get('chunk_id'), {})
        roles = list(approved.get('allowed_uses', [])) if approved.get('text_sha256') == fingerprint else []
        if not roles:
            reasons.append('本块尚未完成用途审核，或原文指纹已改变')
    else:
        roles = ['candidate_discovery'] if status == 'transfer_pending' else []
    if status in ('authority_pending', 'transfer_pending') or set(flags) & {'fulltext_required', 'text_extraction_required'}:
        roles = ['candidate_discovery'] if status == 'transfer_pending' else []
    return {'status': status, 'restrictions': sorted(set(flags)), 'allowed_uses': roles,
            'reasons': reasons, 'local_disease_validation': False,
            'original_region': region, 'original_review_status': record.get('review_status')}


def diagnostic_document_scope(chunk, context, organ):
    """Generic explanation is separate from local production advice admission."""
    from .fusion import applicability
    tier = classify(chunk, 'chunk')
    warnings = []
    if organ == 'leaf':
        from .symptom_scope import document_symptom_warnings
        warnings = document_symptom_warnings(chunk, ['叶片症状'])
        if warnings:
            return False, {}, warnings, tier
    if organ == 'leaf' and 'postharvest_only' in tier['restrictions']:
        return False, {}, ['scope:postharvest_only'], tier
    roles = set(tier['allowed_uses'])
    if not roles & {'candidate_explanation', 'production_background'}:
        return False, {}, ['scope:not_reviewed_for_diagnostic_explanation'], tier
    scoped = dict(context)
    if tier['status'] == 'general_authoritative' and 'candidate_explanation' in roles:
        scoped.pop('region', None)
        warnings.append('general_only:not_local_disease_validation_or_local_advice')
    elif tier['status'] not in ('local_verified', 'hebei_verified'):
        return False, {}, ['scope:not_admissible'], tier
    # Unknown stage remains unknown. An explicitly supplied stage is never dropped.
    ok, matches, reasons = applicability(chunk, scoped, 'strict')
    if 'production_background' in roles:
        warnings.append('background_only:cannot_validate_local_disease_or_supply_referenced_standard_text')
    return ok, matches, warnings + reasons, tier
