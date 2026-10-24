"""Derive R23-02 component; refuse overwriting released outputs."""
import argparse,hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'releases/1.49.20/panels.mjs').read_text()
assert hashlib.sha256(s.encode()).hexdigest()=='258359fcf7487c1f43f4470efcbb9e758e8a222230ad3aa74f9216672f6475b6'
old="      publish();\n      if(['acceptEma','resumeEma','travel'].includes(name)){\n        close();try{await triggerSlash('/trigger');}"
new="      if(disposed||epoch!==startEpoch)return {ok:true,generationSkipped:true};\n      publish();\n      if(['acceptEma','resumeEma','travel'].includes(name)){\n        if(disposed||epoch!==startEpoch)return {ok:true,generationSkipped:true};\n        close();try{await triggerSlash('/trigger');}"
assert s.count(old)==1
result=s.replace(old,new).replace("const version = '1.49.20';","const version = '1.49.25';")
assert result.replace(new,old).replace("const version = '1.49.25';","const version = '1.49.20';")==s
p=argparse.ArgumentParser();p.add_argument('--dry-run',action='store_true');args=p.parse_args()
out=root/'releases/1.49.25/panels.mjs';assert not out.exists()
if not args.dry_run:out.write_text(result)
print(json.dumps({'dry_run':args.dry_run,'sha256':hashlib.sha256(result.encode()).hexdigest(),'bytes':len(result.encode())}))
