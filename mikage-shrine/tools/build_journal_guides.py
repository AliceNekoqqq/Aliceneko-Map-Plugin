#!/usr/bin/env python3
"""Add linked unlock destinations and contextual guides to the journal window."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.45/modules/panels.mjs'
BASE_SHA256 = '79730919b81cef7348a84239a395b527d50c52a4a7f72fd44ff75cbfc809cf85'
VERSION = '1.49.48'


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    assets = ROOT / 'src/journal'
    html = replace_once(html, '</head>', '<style id="mikage-journal-guide">\n' + (assets / 'guide.css').read_text() + '</style></head>')
    core = '/* Read-only presentation helpers. Never changes task or archive authority. */'
    html = replace_once(html, core, '\n'.join((assets / f).read_text() for f in ('feature-links.js', 'guide.js')) + '\n' + core)
    html = replace_once(html, '  function openDialog(name) {', (assets / 'navigation.js').read_text() + '\n  function openDialog(name, target) {')
    html = replace_once(html, "    if (name === 'life') window.ShrineLifeUI?.render();", """    if (['board','map','wardrobe'].includes(name) && !(target?.kind==='quest' || target?.kind==='feature')) journalGuide.show(dialog,name);
    if (name === 'life' && !target) window.ShrineLifeUI?.render();""")
    html = replace_once(html, '  function closeDialog(restoreFocus) {', '''  function closeDialog(restoreFocus) {
    journalNavVersion++;
    journalGuide.hide();
    linkedOutfit=null;highlightJournalTarget(null);''')
    for page in ('Board','Map','Wardrobe','Life'):
        html = replace_once(html, f"  function onOpen{page}() {{ openDialog('{page.lower()}'); }}",
            f"  function onOpen{page}(target) {{ return openJournalPage('{page.lower()}', target?.kind ? target : null); }}")
    html = replace_once(html, "    if (actorButton) { wardrobeActor", "    if (actorButton) { linkedOutfit=null;highlightJournalTarget(null);journalGuide.show($('#wardrobe-dialog'),'wardrobe');wardrobeActor")
    html = replace_once(html, "if (activeDialog === 'wardrobe') renderWardrobe(); if (activeDialog === 'map') renderMap();",
        "if (activeDialog === 'wardrobe') {if(linkedOutfit)showLinkedOutfit();else renderWardrobe();} if (activeDialog === 'map') renderMap();")
    html = replace_once(html, "      if (locked) {\n          wardrobePreviewId = outfitId;",
        "      linkedOutfit=null;highlightJournalTarget(null);\n        if (locked) {\n          wardrobePreviewId = outfitId;")
    html = replace_once(html, "if(quest.status!=='未悬挂'){openDialog('board');return;}",
        "if(quest.status!=='未悬挂'){await openJournalPage('board',{kind:'main',id:questId});return;}")
    html = replace_once(html, "          if(ok)openDialog('board');",
        "          if(ok)await openJournalPage('board',{kind:'main',id:questId});")
    html = replace_once(html, " window.MikagePanelPresentation={board,",
        """ function focusEma(id){
  const card=[...$('ema-grid').querySelectorAll('[data-ema-id]')].find(node=>node.dataset.emaId===id);
  if(!card)return false;
  statusFilter='all';filterBoard();selectEma(card,true,false);return true;
 }
 window.MikagePanelPresentation={board,focusEma,""")
    html = replace_once(html, "   window.ShrinePanel?.applyDaylight?.();\n   $('#life-context')", "   window.ShrinePanel?.showLifeGuide?.(view,tab);\n   window.ShrinePanel?.applyDaylight?.();\n   $('#life-context')")
    html = replace_once(html, "   $('#life-content').replaceChildren();({home:renderHome", """   const activeTab=nav.querySelector('[aria-pressed=true]');
   if(activeTab && nav.scrollWidth>nav.clientWidth){
     const control=activeTab.getBoundingClientRect(),viewport=nav.getBoundingClientRect();
     nav.scrollLeft+=Math.max(0,control.right-viewport.right+6)+Math.min(0,control.left-viewport.left-6);
   }
   $('#life-content').replaceChildren();({home:renderHome""")
    html = replace_once(html, " window.ShrineLifeUI={render,dispose()",
        """ window.ShrineLifeUI={render,async go(next,recipe){
  if(!tabs.some(([id])=>id===next))return null;
  tab=next;await render();
  if(tab!==next)return null;
  return recipe?[...$('#life-content').querySelectorAll('[data-life-craft]')].find(button=>button.dataset.lifeCraft===recipe)?.closest('.life-card')??null:null;
 },dispose()""")
    html = replace_once(html, "    window.ShrinePanel.ready=true;", """    if (bridge) panelStateReady=Promise.resolve().then(()=>bridge.getState()).then(next=>{
      snapshot=unwrap(next);render();
    }).catch(error=>showToast('读取神社状态失败：'+(error.message||'未知错误')));
    window.ShrinePanel.ready=true;""")
    html = replace_once(html, """      try { snapshot = unwrap(await bridge.getState()); render(); }
      catch (error) { showToast('读取神社状态失败：' + (error.message || '未知错误')); }""", '      await panelStateReady;')
    html = replace_once(html, 'regions: REGIONS, applyDaylight };', 'regions: REGIONS, applyDaylight, showLifeGuide };')
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    source = replace_once(source, "const version = '1.49.45';", f"const version = '{VERSION}';")
    source = replace_once(source, '  function close(){\n    cancelEmaRequest();', '''  let panelOpener=null, panelNavigation=0;
  function close(){
    panelNavigation++;
    const opener=panelOpener;panelOpener=null;
    cancelEmaRequest();''')
    source = replace_once(source, "    listeners.clear();presented='';\n  }\n  async function open(kind){",
        """    listeners.clear();presented='';
    if(opener?.isConnected)opener.focus({preventScroll:true});
  }
  async function open(kind,target){""")
    start = source.index('    const activate=()=>{', source.index('  async function open(kind,target)'))
    end = source.index('    if(!frame){', start)
    source = source[:start]+'''    const request=++panelNavigation;
'''+source[end:]
    source = replace_once(source, '    if(!frame){\n      removeStalePanelNodes();',
        '    if(!frame){\n      panelOpener=doc.activeElement;\n      removeStalePanelNodes();')
    source = replace_once(source, "      frame.addEventListener('load',activate);\n", '')
    source = replace_once(source, '      activate();\n      closeButton=', '      closeButton=')
    return replace_once(source, '''    }else activate();
  }
  function parseGenerated''', '''    }
    const owner=frame,child=owner.contentWindow;
    if(!child?.ShrinePanel?.ready)await new Promise((resolve,reject)=>{
      const done=()=>{clearTimeout(timer);child.removeEventListener('mikage:panel-ready',done);resolve();};
      const timer=setTimeout(()=>{
        child.removeEventListener('mikage:panel-ready',done);
        if(owner!==frame || request!==panelNavigation)resolve();
        else reject(Error('手帖尚未载入。'));
      },2500);
      child.addEventListener('mikage:panel-ready',done,{once:true});
    });
    if(request!==panelNavigation || frame!==owner)return;
    if(closeButton){closeButton.hidden=true;placeCloseButton();}
    return child.ShrinePanel[method](target);
  }
  function parseGenerated''')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--module', required=True, type=Path)
    parser.add_argument('--card-source', type=Path)
    parser.add_argument('--card-output', type=Path)
    parser.add_argument('--commit')
    args = parser.parse_args()
    if any([args.card_source, args.card_output, args.commit]):
        if not all([args.card_source, args.card_output, args.commit]):
            parser.error('--card-source, --card-output and --commit are required together')
        args.card_output.write_text(build_card(args.card_source,args.module,args.commit,version=VERSION))
    else:
        args.module.parent.mkdir(parents=True,exist_ok=True)
        args.module.write_text(build_module())
