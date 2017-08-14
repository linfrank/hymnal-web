hymnal-web
==========

Better online browsing / display of (mainly LSM) hymns

My attempt at nicer, responsive static website for browsing hymns. Uses the output from https://github.com/linfrank/hymnal-tool.

Deployment
----------

1. Copy hymnal data produced by https://github.com/linfrank/hymnal-tool in single-json format under `www/data`.

2. Run Google Cloud tool:
  ```
  gcloud app deploy
  ```
