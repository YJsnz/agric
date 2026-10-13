# Jujube Model A dataset audit

## Sources and scope
- https://data.mendeley.com/datasets/yxmf3cd865/4 (DOI series yxmf3cd865). Local version unverified: 1,009 images; current v4 description says 1,260, not evidence that local files are missing. Do not substitute official stated counts for measured counts.
- https://data.mendeley.com/datasets/58py9f3nsy/1 : 2,210 class-folder images plus one certificate JPEG, excluded as unknown_class. Both source pages describe original/unaugmented images, CC BY 4.0.
- These sources do not establish a Cangzhou Jinsi cultivar-specific dataset or local diagnostic validity. Attribution required. Yellowing is not a confirmed nutrient deficiency.

## Cleaning and splitting
Decode/verify every image; EXIF-corrected RGB used only in memory for pHash and pixel hashes. Raw files copied byte-for-byte, not edited. Known directory aliases only. Suspicious augmentation/path markers excluded. SHA256 label conflicts exclude every member; same-label exact copies retain one valid stable representative. No oversampling, augmentation, training, or new labels.

pHash is 64-bit DCT, Hamming distance <= 6 by default. ALL candidate edges, exact hashes and decoded-pixel equalities are unioned into conservative leakage components, including links through excluded images. Similarity alone causes no deletion. Components are not claimed to be verified same-leaf groups. Transitive grouping may over-group; pHash can miss rotations, crops and consecutive views. No reliable plant/leaf/burst metadata: **group identity unavailable**. Potential same-leaf leakage remains possible despite zero measured cross-split groups. Cross-label near pairs require review, not automatic relabelling.

Seed 42; deterministic group allocation optimizes source/class strata near 70/15/15. Components cannot cross splits. This is a source-aware internal split, NOT a held-out-source evaluation or official split. The sources share contributors/institution; two source IDs do not establish independent collection domains.

## Measured counts, split distributions and verification
```json
{
  "raw_total": 3220,
  "sources": {
    "yxmf3cd865": 1009,
    "58py9f3nsy": 2211
  },
  "excluded": {
    "augmented": 0,
    "duplicate_same_label": 4,
    "label_conflict": 8,
    "corrupt": 8,
    "unknown_class": 1
  },
  "clean_total": 3201,
  "classes": {
    "anthracnose": 716,
    "healthy": 1164,
    "insect_damage": 394,
    "powdery_mildew": 217,
    "yellow_leaf": 710
  },
  "splits": {
    "train": {
      "total": 2289,
      "classes": {
        "anthracnose": 501,
        "healthy": 815,
        "insect_damage": 276,
        "powdery_mildew": 160,
        "yellow_leaf": 537
      },
      "sources": {
        "yxmf3cd865": 706,
        "58py9f3nsy": 1583
      }
    },
    "val": {
      "total": 458,
      "classes": {
        "anthracnose": 108,
        "healthy": 175,
        "insect_damage": 59,
        "powdery_mildew": 29,
        "yellow_leaf": 87
      },
      "sources": {
        "yxmf3cd865": 152,
        "58py9f3nsy": 306
      }
    },
    "test": {
      "total": 454,
      "classes": {
        "anthracnose": 107,
        "healthy": 174,
        "insect_damage": 59,
        "powdery_mildew": 28,
        "yellow_leaf": 86
      },
      "sources": {
        "yxmf3cd865": 151,
        "58py9f3nsy": 303
      }
    }
  },
  "near_duplicate_pairs": 14749,
  "cross_source_near_pairs": 7,
  "cross_class_near_pairs": 8634,
  "leakage_groups": 1499,
  "largest_group": 1434,
  "checks": {
    "cross_split_sha256": 0,
    "cross_split_duplicate_group": 0,
    "raw_changes": 0,
    "target_filename_duplicate": 0,
    "actual_output_images": 3201,
    "expected_output_images": 3201,
    "label_conflict_entered": 0,
    "augmented_entered": 0,
    "corrupt_entered": 0,
    "unknown_class_entered": 0,
    "duplicate_same_label_entered": 0
  },
  "training_readiness": "not_ready_for_final_training: cross-class near candidates and conservative large components require review"
}
```

## Readiness
Folders are usable for an exploratory five-class baseline only if all classes are represented. Not an unqualified final scientific evaluation: review cross-class similarity candidates, investigate source-version/count discrepancy, and validate on independent local leaves before asserting generalization. Class imbalance (especially powdery_mildew) is preserved. This task did not start training.

## Additional review findings
The 12-pair cross-label contact sheet (model_a_cross_label_contact_sheet.jpg) shows repeated backgrounds and centered small leaves dominating global pHash. pHash distance zero does NOT establish identical leaves or a wrong label. No additional samples were deleted based on this contact sheet. The 1,434-image conservative component is not a verified same-leaf group. It prevents detected similarity links crossing splits but makes this allocation provisional for final training.

There are 19 unique excluded image files: 4 same-label redundant copies, 8 conflicting-label files, 8 corrupt files and 1 unknown-class certificate; 2 corrupt files also have label_conflict, so counters overlap. All counts describe local files, not the publisher's expected counts. Neither training nor augmentation was started.

Sources checked on 2026-10-06: yxmf3cd865 versions 1-4 all describe 1,260 images; the local 1,009-image release/version cannot be established from folder metadata alone. This discrepancy remains unresolved, not treated as proof of missing files.
