# Tomato leaf V1 — new archival evaluation

This is a new run, not reconstruction of the missing historical run. Public greenhouse internal image-level test; not Qingxian field accuracy or final disease diagnosis.

{
  "accuracy": 0.8705378391242266,
  "balanced_accuracy": 0.8436225109619288,
  "macro_precision": 0.8498455166227732,
  "macro_recall": 0.8436225109619288,
  "macro_f1": 0.8464744898813577,
  "weighted_precision": 0.8700749988709701,
  "weighted_recall": 0.8705378391242266,
  "weighted_f1": 0.8701823636685247,
  "macro_roc_auc_ovr": 0.9817735390948442,
  "per_class": {
    "bacterial_spot": {
      "precision": 0.8409090909090909,
      "recall": 0.8409090909090909,
      "f1": 0.8409090909090909,
      "support": 352
    },
    "bacterial_spot_and_leaf_miner": {
      "precision": 0.8559782608695652,
      "recall": 0.8422459893048129,
      "f1": 0.8490566037735849,
      "support": 374
    },
    "healthy": {
      "precision": 0.9168831168831169,
      "recall": 0.9388297872340425,
      "f1": 0.9277266754270697,
      "support": 376
    },
    "leaf_miner": {
      "precision": 0.8855421686746988,
      "recall": 0.9046153846153846,
      "f1": 0.8949771689497716,
      "support": 325
    },
    "powdery_mildew": {
      "precision": 0.8515901060070671,
      "recall": 0.8669064748201439,
      "f1": 0.8591800356506238,
      "support": 278
    },
    "powdery_mildew_and_leaf_miner": {
      "precision": 0.8869047619047619,
      "recall": 0.8587896253602305,
      "f1": 0.8726207906295754,
      "support": 347
    },
    "whitefly": {
      "precision": 0.7111111111111111,
      "recall": 0.6530612244897959,
      "f1": 0.6808510638297872,
      "support": 49
    }
  }
}

Input and weight SHA256 were verified unchanged. See metrics.json for method, versions and limitations.
