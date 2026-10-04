# Data layout

Nothing in this folder is committed to git (see `.gitignore`).

```
data/
├── raw/<source>/                 your recordings, one folder per source (e.g. own, kaggle_alphabet)
│   ├── videos/<LABEL>/*.mp4      label = folder name (e.g. HELLO, THANK_YOU)
│   ├── images/<LABEL>/*.jpg
│   └── signers.csv               optional but strongly recommended: relative_path,signer_id
├── external/                     downloaded public datasets (INCLUDE pose lives here)
├── processed/landmarks/<source>/ extracted .npz landmark sequences (generated)
└── metadata/
    ├── manifest_<source>.csv     one row per clip with quality metrics (generated)
    └── splits/<name>/            train/val/test CSVs, classes.json, split_report.json (generated)
```

`signers.csv` example (paths relative to `data/raw/<source>/`):

```csv
relative_path,signer_id
videos/HELLO/clip_001.mp4,S01
videos/HELLO/clip_002.mp4,S02
```

Collection guideline: at least 10 different signers x 5 repetitions per sign, varied lighting,
backgrounds and distances, both dominant hands. Get consent; store landmarks rather than video
when you can.
