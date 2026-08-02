/**
 * update-checker.js — 自动检测文档更新，提示用户刷新
 *
 * 原理：
 *   1. 页面加载时用 fetch(cache:'no-store') 请求 version.json（带时间戳防 CDN 缓存）
 *   2. 与 localStorage 中上次访问时存储的版本号对比
 *   3. 若版本不同：首次访问只存储；非首次访问显示顶部更新横幅
 *   4. 页面打开期间每 3 分钟轮询一次，发现更新也显示横幅
 *
 * 使用：在每个 HTML 页面 </body> 前加入
 *   <script src="[相对路径]/update-checker.js"></script>
 *
 * 更新 version.json：每次 push 前运行
 *   echo '{"v":"'$(date +%Y%m%d%H%M%S)'","t":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > version.json
 */
(function () {
  var STORAGE_KEY = 'megatron_docs_version';
  var POLL_MS = 3 * 60 * 1000; // 3 min

  /* ---- 计算 version.json 的绝对 URL ---- */
  var src = document.currentScript && document.currentScript.src;
  if (!src) return;
  var rootUrl = src.slice(0, src.lastIndexOf('/') + 1);
  var versionUrl = rootUrl + 'version.json';

  /* ---- 版本检查 ---- */
  function check(isInit) {
    fetch(versionUrl + '?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var remote = d.v;
        var local  = localStorage.getItem(STORAGE_KEY);
        if (!local) {
          // 首次访问，仅记录
          localStorage.setItem(STORAGE_KEY, remote);
          return;
        }
        if (local !== remote) {
          localStorage.setItem(STORAGE_KEY, remote);
          if (!isInit) {
            // 页面打开期间检测到更新 → 横幅
            showBanner();
          } else {
            // 新页面加载时检测到更新 → 自动刷新一次（通过 sessionStorage 防止死循环）
            var reloadKey = 'megatron_docs_reloaded_' + remote;
            if (!sessionStorage.getItem(reloadKey)) {
              sessionStorage.setItem(reloadKey, '1');
              location.reload();
              return;
            }
          }
        }
      })
      .catch(function () { /* 离线或 CDN 未更新，静默忽略 */ });
  }

  /* ---- 更新横幅 ---- */
  function showBanner() {
    if (document.getElementById('megatron-update-banner')) return;
    var el = document.createElement('div');
    el.id = 'megatron-update-banner';
    el.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:99999;' +
      'background:linear-gradient(135deg,#1f6feb,#8957e5);color:#fff;' +
      'text-align:center;padding:12px 16px;font-size:14px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.3);';
    el.innerHTML =
      '\u6587\u6863\u5df2\u66f4\u65b0 \u00b7 ' +
      '<a onclick="location.reload()" style="color:#fff;font-weight:700;' +
      'text-decoration:underline;cursor:pointer;">\u70b9\u51fb\u5237\u65b0</a>' +
      ' \u67e5\u770b\u6700\u65b0\u5185\u5bb9' +
      '<span onclick="this.parentNode.remove()" style="position:absolute;right:12px;' +
      'top:50%;transform:translateY(-50%);cursor:pointer;font-size:18px;">\u00d7</span>';
    document.body.insertBefore(el, document.body.firstChild);
  }

  /* ---- 启动 ---- */
  check(true);
  setInterval(function () { check(false); }, POLL_MS);
})();
