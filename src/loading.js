// 在页面加载的最早阶段锁定滚动，防止用户在加载期间滚动页面
// 将 scrollTop 保存到 window 对象，以便 scripts.js 中的 unlockScroll 可以访问
(function () {
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    window._tkctfScrollTop = scrollTop;

    function lockScrollEarly() {
        var body = document.body;
        if (body && body.style && body.style.position !== 'fixed') {
            scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
            window._tkctfScrollTop = scrollTop;
            body.style.position = "fixed";
            body.style.top = "-" + scrollTop + "px";
            body.style.left = "0";
            body.style.right = "0";
            body.style.width = "100%";
            body.style.overflow = "hidden";
        } else if (document.readyState === 'loading' && (!body || !body.style)) {
            // body 还不存在，等待 DOM 加载
            setTimeout(lockScrollEarly, 10);
        }
    }
    // 立即尝试
    lockScrollEarly();
    // 也监听 DOMContentLoaded 作为备用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lockScrollEarly);
    }
})();
