/* Replace __COMMIT__, __SCRIPT_ID__, __MODULE_PATH__, __VERSION__, __LABEL__.
 * This is an executable classic script suitable for a Tavern Helper script content.
 * Each remote module must export VERSION, SCRIPT_ID and start().
 * Do not put application side effects at module scope: they belong inside start().
 */
(function installRemoteLoader(config) {
  const states = globalThis.__MIKAGE_REMOTE_LOADERS__ ||= Object.create(null);
  const retries = globalThis.__MIKAGE_REMOTE_RETRY__ ||= Object.create(null);
  const existing = states[config.scriptId];
  if (existing) {
    // A duplicate bootstrap reuses the existing state and never installs listeners twice.
    if (existing.status === 'failed') existing.retry();
    return;
  }
  const state = states[config.scriptId] = {
    status: 'idle', promise: null, retry: null, node: null, error: null, attempt: 0, module: null,
  };
  const resource = `${config.repository}@${config.commit}/${config.modulePath}`;
  const urls = [
    `https://cdn.jsdelivr.net/gh/${resource}`,
    `https://testingcf.jsdelivr.net/gh/${resource}`,
    `https://raw.githubusercontent.com/${config.repository}/${config.commit}/${config.modulePath}`,
  ];
  function removeNotice() {
    state.node?.remove();
    state.node = null;
  }
  function showNotice(blocked) {
    if (!globalThis.document?.body) {
      console.error(`[${config.label}]`, state.error);
      return;
    }
    removeNotice();
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;z-index:2147483647;padding:12px;border:1px solid #c18b9a;border-radius:10px;background:#fff7fa;color:#55313e;font:14px/1.5 sans-serif;box-shadow:0 4px 18px #0003';
    const message = document.createElement('span');
    message.textContent = blocked
      ? `${config.label}启动中断，请停用后重新启用此脚本。`
      : `${config.label}资源加载失败，请检查网络后重试。`;
    box.append(message);
    if (!blocked) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '重新加载';
      button.style.cssText = 'margin-left:10px;padding:5px 10px;cursor:pointer';
      button.addEventListener('click', () => { void state.retry(); });
      box.append(button);
    }
    document.body.append(box);
    state.node = box;
    console.error(`[${config.label}]`, state.error);
  }
  async function importWithTimeout(url) {
    let timer;
    try {
      return await Promise.race([
        import(url),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('远程资源请求超时')), config.timeoutMs);
        }),
      ]);
    } finally { clearTimeout(timer); }
  }
  async function load() {
    if (state.status === 'running' || state.status === 'starting' || state.status === 'blocked') return false;
    if (state.promise) return state.promise;
    state.status = 'loading';
    state.attempt += 1;
    removeNotice();
    state.promise = (async () => {
      const errors = [];
      // A retryable start reuses the same module/closure. Importing a new URL
      // here would register the module's already-installed listeners again.
      let module = state.module;
      if (!module) for (const url of urls) {
        try {
          // Failed ESM fetches can remain cached in a WebView. Retry with a fresh
          // request URL while keeping the immutable repository commit unchanged.
          const requestUrl = state.attempt === 1 ? url : `${url}?mikage_retry=${state.attempt}`;
          const candidate = await importWithTimeout(requestUrl);
          if (candidate.VERSION !== config.version || candidate.SCRIPT_ID !== config.scriptId || typeof candidate.start !== 'function') {
            throw new Error('远程模块版本或标识不匹配');
          }
          module = candidate;
          break;
        } catch (error) {
          errors.push(`${new URL(url).hostname}: ${String(error?.message || error)}`);
        }
      }
      if (!module) {
        state.status = 'failed';
        state.error = errors.join(' | ');
        showNotice(false);
        return false;
      }
      // Crucial: call start exactly once. A failed start may already have registered
      // listeners or changed state, so never try the next CDN or retry start here.
      state.status = 'starting';
      try {
        await module.start();
        state.status = 'running';
        state.error = null;
        removeNotice();
        return true;
      } catch (error) {
        // Only a module that explicitly guarantees no committed bootstrap
        // effects may retry. Unknown/partial starts still require re-enabling.
        const retryable = error?.mikageRetryableStart === true;
        state.module = retryable ? module : null;
        state.status = retryable ? 'failed' : 'blocked';
        state.error = String(error?.stack || error?.message || error);
        showNotice(!retryable);
        return false;
      }
    })().finally(() => { state.promise = null; });
    return state.promise;
  }
  state.retry = load;
  if (config.scriptId === 'minigames') {
  // Tavern Helper runs each script in a separate iframe. Publish the loader
  // on the same parent window as the modal API and the statusbar host.
  const sharedHost = window.parent || window;
  const sharedLoader = {
    version: config.version,
    getStatus: () => ({status:state.status,error:state.error}),
    async ensureReady() {
      await load();
      const api = sharedHost.MikageMinigames;
      if (typeof api?.open !== 'function' || api.version !== config.version) {
        throw new Error(state.status === 'blocked'
          ? '独立小游戏启动失败，请停用后重新启用该脚本。'
          : '独立小游戏资源加载失败，请检查网络后点“重新加载资源”。');
      }
      return api;
    },
  };
  sharedHost.MikageMinigamesLoader = sharedLoader;
  window.addEventListener('pagehide', () => {
    if (sharedHost.MikageMinigamesLoader === sharedLoader) delete sharedHost.MikageMinigamesLoader;
  }, {once:true});
  }
  retries[config.scriptId] = load;
  // Optional Tavern Helper button: match this name in the script's button config.
  if (typeof globalThis.eventOn === 'function' && typeof globalThis.getButtonEvent === 'function') {
    globalThis.eventOn(globalThis.getButtonEvent(config.retryButton), () => { void load(); });
  }
  void load();
})({
  repository: 'AliceNekoqqq/Aliceneko-Map-Plugin',
  commit: '__COMMIT__',
  modulePath: '__MODULE_PATH__',
  scriptId: '__SCRIPT_ID__',
  version: '__VERSION__',
  label: '__LABEL__',
  retryButton: '重新加载资源',
  timeoutMs: 15000,
});

