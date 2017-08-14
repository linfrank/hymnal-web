hymnal-web
==========

Better online browsing / display of (mainly LSM) hymns

My attempt at nicer, responsive static website for browsing hymns. Uses the output from https://github.com/linfrank/hymnal-tool.

Local Staging
-------------

1. Install Python (or upgrade it if you already have it):
```
brew install python
```
or
```
brew upgrade python
```

2. CD into the `www` directory and run SimpleHTTPServer
```
cd www
python -m SimpleHTTPServer
```

3. Point your browser to `http://localhost:8000`

Deployment
----------

1. Copy hymnal data produced by https://github.com/linfrank/hymnal-tool in single-json format under `www/data`.

2. Run Google Cloud tool:
```
gcloud app deploy
```
