"""Derive the portrait CORS component checkpoint; preserve released modules."""
import argparse, hashlib, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root/'releases/1.49.24'
plan=json.loads((out/'plan.json').read_text())
source=(root/plan['base_module']).read_text()
assert hashlib.sha256(source.encode()).hexdigest()==plan['base_sha256']
old='const im=new Image();im.onload='
new="const im=new Image();im.crossOrigin='anonymous';im.onload="
assert source.count(old)==1
result=source.replace(old,new).replace("VERSION = '0.1.0'", "VERSION = '0.1.1'").replace("version:'0.1.0'", "version:'0.1.1'")
assert result.replace(new,old).replace("VERSION = '0.1.1'", "VERSION = '0.1.0'").replace("version:'0.1.1'", "version:'0.1.0'")==source
p=argparse.ArgumentParser();p.add_argument('--dry-run',action='store_true');args=p.parse_args()
target=out/'tomoe.mjs'
assert not target.exists(), 'Fresh output required'
if not args.dry_run:target.write_text(result)
print(json.dumps({'dry_run':args.dry_run,'bytes':len(result.encode()),'sha256':hashlib.sha256(result.encode()).hexdigest()}))
