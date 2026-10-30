import assert from 'node:assert/strict';
export async function checkArchiveKeyboard(page){
 const focused=locator=>locator.evaluate(n=>n.getRootNode().activeElement===n);
 const open=async()=>{await page.locator('#before').focus();await page.evaluate(async()=>{MikageTaskArchives.open();await MikageTaskArchives.refresh();});};
 const snapshot=()=>page.evaluate(()=>JSON.stringify({calls:test.calls,writes:test.writes,vars:test.chats.A.vars,books:test.books,settings:localStorage.getItem('mikage.task-archive.settings.v1')}));
 let count=0;
 for(const width of [320,375,1000])for(const height of [520,812]){
  await page.setViewportSize({width,height});
  await page.keyboard.press('Escape');await open();
  const close=page.getByRole('button',{name:'关闭',exact:true}),config=page.locator('.archive-config>summary');
  const before=await snapshot();
  await page.keyboard.press('Tab');assert(await focused(close),'initial Tab reaches first Close control');
  await page.keyboard.press('Shift+Tab');assert(await focused(config),'Shift+Tab from first control stays inside and reaches last');
  await page.keyboard.press('Tab');assert(await focused(close),'Tab from last control wraps to first');
  await page.locator('.dialog').focus();await page.keyboard.press('Shift+Tab');assert(await focused(config),'initial dialog Shift+Tab reaches last');
  await config.press('Enter');
  const last=page.getByRole('button',{name:'测试独立API · 调用1次',exact:true,includeHidden:true});
  await close.focus();await page.keyboard.press('Shift+Tab');assert(await focused(last),'expanded settings changes last sequential control');
  await page.keyboard.press('Tab');assert(await focused(close));
  // A programmatically focused page element must not let the next Tab escape.
  await page.locator('#before').focus();await page.keyboard.press('Tab');assert(await focused(close));
  await page.locator('#before').focus();await page.keyboard.press('Shift+Tab');assert(await focused(last));
  for(const attr of ['disabled','tabindex','hidden']){
   await last.evaluate((n,attr)=>n.setAttribute(attr,attr==='tabindex'?'-1':''),attr);
   await close.focus();await page.keyboard.press('Shift+Tab');assert(await focused(page.getByRole('button',{name:'保存设置',exact:true})),attr+' control is excluded');
   await last.evaluate((n,attr)=>n.removeAttribute(attr),attr);
  }
  // Actual browser traversal, including native summary/select/input behavior.
  for(const key of ['Tab','Shift+Tab'])for(let i=0;i<38;i++){
   await page.keyboard.press(key);
   assert(await page.locator('.dialog').evaluate(n=>n.contains(n.getRootNode().activeElement)),'focus contained at '+key+' '+i);
  }
  assert.equal(await snapshot(),before,'navigation may not change archive/settings or call a model');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.dialog').count(),0);assert(await focused(page.locator('#before')),'Escape returns to original opener');
  count++;
 }
 const launcher=page.getByRole('button',{name:'任务档案',exact:true});
 await launcher.focus();await page.keyboard.press('Enter');await page.waitForSelector('.dialog');
 await page.keyboard.press('Escape');assert(await focused(launcher),'keyboard launcher gets focus back');
 await open();
 console.log('PASS archive keyboard: '+count+' viewport pairs; both boundaries, initial focus, expanded/disabled/hidden/negative controls, outside-focus recovery, 456 traversal steps, Escape and opener return; no navigation data/model effects.');
}
