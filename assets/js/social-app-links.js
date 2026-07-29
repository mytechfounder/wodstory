(function () {
  "use strict";

  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!isAndroid && !isIOS) return;

  function makeAndroidIntent(appUrl, packageName, fallbackUrl) {
    const schemeSeparator = appUrl.indexOf("://");
    const scheme = appUrl.slice(0, schemeSeparator);
    const destination = appUrl.slice(schemeSeparator + 3);

    return `intent://${destination}#Intent;scheme=${scheme};package=${packageName};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
  }

  function getSocialAppUrl(webUrl) {
    let url;

    try {
      url = new URL(webUrl, window.location.href);
    } catch (_error) {
      return null;
    }

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const username = url.pathname.split("/").filter(Boolean)[0];

    if (!username) return null;

    if (host === "instagram.com") {
      const appUrl = `instagram://user?username=${encodeURIComponent(username)}`;
      return isAndroid
        ? makeAndroidIntent(appUrl, "com.instagram.android", url.href)
        : appUrl;
    }

    if (host === "x.com" || host === "twitter.com") {
      const appUrl = `twitter://user?screen_name=${encodeURIComponent(username)}`;
      return isAndroid
        ? makeAndroidIntent(appUrl, "com.twitter.android", url.href)
        : appUrl;
    }

    if (host === "facebook.com" || host === "m.facebook.com") {
      if (isAndroid) {
        const fallback = encodeURIComponent(url.href);
        return `intent://${host}${url.pathname}#Intent;scheme=https;package=com.facebook.katana;S.browser_fallback_url=${fallback};end`;
      }

      return `fb://facewebmodal/f?href=${encodeURIComponent(url.href)}`;
    }

    if (host === "t.me" || host === "telegram.me") {
      const appUrl = `tg://resolve?domain=${encodeURIComponent(username)}&profile`;
      return isAndroid
        ? makeAndroidIntent(appUrl, "org.telegram.messenger", url.href)
        : appUrl;
    }

    if (host === "linkedin.com") {
      if (isAndroid) {
        const fallback = encodeURIComponent(url.href);
        return `intent://${host}${url.pathname}#Intent;scheme=https;package=com.linkedin.android;S.browser_fallback_url=${fallback};end`;
      }

      // LinkedIn uses its verified HTTPS universal link on iPhone/iPad.
      return url.href;
    }

    return null;
  }

  function openAppWithFallback(appUrl, webUrl) {
    let fallbackTimer;
    let pageWasHidden = false;

    const cleanup = function () {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };

    const handleVisibilityChange = function () {
      if (document.hidden) {
        pageWasHidden = true;
        cleanup();
      }
    };

    const handlePageHide = function () {
      pageWasHidden = true;
      cleanup();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    fallbackTimer = window.setTimeout(function () {
      cleanup();
      if (!pageWasHidden) window.location.assign(webUrl);
    }, 1400);

    window.location.assign(appUrl);
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const webUrl = link.href;
    const appUrl = getSocialAppUrl(webUrl);
    if (!appUrl) return;

    event.preventDefault();

    // HTTPS universal links (LinkedIn on iOS) are handled directly by the OS.
    if (appUrl === webUrl) {
      window.location.assign(webUrl);
      return;
    }

    openAppWithFallback(appUrl, webUrl);
  });
})();
