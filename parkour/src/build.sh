#!/bin/sh
# Builds ../index.html from core.html with level 2 spliced in at the /*@LEVEL2@*/ marker.
# Run from this folder: sh build.sh
set -e
python3 - <<'PY'
s=open('core.html').read(); d=open('level2-robec.js').read()
assert '/*@LEVEL2@*/' in s
body=s.replace('/*@LEVEL2@*/',d+'\n/*@LEVEL2@*/')
head='''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#08102a">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-192.png">
<link rel="icon" href="icon-192.png" type="image/png">
</head>
<body>
'''
tail='''<script>if("serviceWorker" in navigator){addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}</script>
</body>
</html>
'''
open('../index.html','w').write(head+body+tail)
PY
