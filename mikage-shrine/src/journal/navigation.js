  const journalGuide = createJournalGuide(document);
  let journalNavVersion = 0, panelStateReady = Promise.resolve(), linkedOutfit = null;

  function highlightJournalTarget(element, scroll=true) {
    $('[data-journal-target]')?.removeAttribute('data-journal-target');
    const guideVisible = journalGuide.point(element);
    if (!element) return;
    element.dataset.journalTarget = '';
    if (scroll && !guideVisible) element.scrollIntoView?.({block:'nearest',behavior:'auto'});
  }

  function showLifeGuide(view,tab) {
    if (activeDialog !== 'life') return;
    const gates = Object.keys(JOURNAL_FEATURES).filter(id => JOURNAL_FEATURES[id][1] === 'life' && JOURNAL_FEATURES[id][2] === tab);
    const unlocked = !gates.length || gates.some(id => view.unlocked?.features?.[id] === true);
    if (unlocked) journalGuide.show($('#life-dialog'),tab);
    else journalGuide.hide();
  }

  function showLinkedOutfit() {
    if (!linkedOutfit) return;
    const {actor,id,quest} = linkedOutfit;
    const outfit = artApi()?.outfits?.(actor)?.find(item=>item.id===id);
    if (!outfit) {showToast('衣装图册正在载入，请稍候。');return;}
    const idShown = outfit.variantOf || outfit.id;
    const owned = (currentState().衣橱?.已解锁 || []).some(item=>item.角色===actor && item.衣装===id);
    wardrobeActor=actor;
    wardrobeChoice=owned?idShown:outfitFor(actor);
    wardrobePreviewId=owned?'':idShown;
    renderWardrobe();
    highlightJournalTarget($(quest?'#wardrobe-quest':'#wardrobe-look-name'));
  }

  async function openJournalPage(name,target) {
    openDialog(name,target);
    const version = ++journalNavVersion;
    if (!target || activeDialog!==name) return;
    await panelStateReady;
    if (version!==journalNavVersion || activeDialog!==name) return;
    const {kind,id}=target;
    if (typeof id!=='string') return;
    highlightJournalTarget(null);
    if (kind==='region' && name==='map' && REGION_BY_ID.has(id)) {
      selectRegion(id);
      highlightJournalTarget($('#place-card'));
      return;
    }
    if (kind==='feature' && Object.hasOwn(JOURNAL_FEATURES,id)) {
      const [,page,tab]=JOURNAL_FEATURES[id];
      if (page!==name) return;
      if (page==='life') await window.ShrineLifeUI.go(tab);
      else journalGuide.show($('#board-dialog'),tab);
      return;
    }
    if (kind==='recipe' && name==='life') {
      const card=await window.ShrineLifeUI.go('craft',id);
      if(version!==journalNavVersion || activeDialog!==name)return;
      if (card) highlightJournalTarget(card);
      else showToast('这个配方在当前进度还不可用。');
      return;
    }
    if (kind==='main' && name==='board') {
      emaFilter='all';
      renderBoard();
      if (window.MikagePanelPresentation?.focusEma(id)) highlightJournalTarget($('#panel-ema-sheet'));
      else showToast('这枚绘马目前没有挂在板上。');
      return;
    }
    if (name!=='wardrobe') return;
    const quest = kind==='quest' && GAME_CONFIG.wardrobeQuests?.find(item=>item.id===id);
    if (quest) {
      const outfit=quest.outfits?.find(item=>!item.variantOf);
      if (!outfit) {showToast('这条支线的衣装暂时不可查看。');return;}
      linkedOutfit={actor:outfit.actor,id:outfit.id,quest:true};
      journalGuide.show($('#wardrobe-dialog'),'quest');
    } else if (kind==='outfit') {
      const [actor,outfitId]=id.split(':');
      if (!['player','tomoe'].includes(actor) || !outfitId) return;
      linkedOutfit={actor,id:outfitId,quest:false};
      journalGuide.show($('#wardrobe-dialog'),'wardrobe');
    }
    showLinkedOutfit();
  }
