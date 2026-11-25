/* WDW beacon v1. Anonymous and cookie-free: no storage, no identifiers, no third parties.
   Requests tiny static files on this site so the server-side log shows that JavaScript ran on a page.
   Mirrors the reading-depth events in engage.js. Fails silently; never affects the page. */
(function () {
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var base = "/_wdw/v1/";
    var page = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
    var slugs = { "/": "home", "/skeleton": "skeleton", "/listen": "listen", "/versions": "versions",
                  "/versions/v17-2026-11-21": "versions-v17-2026-11-21" };
    var sent = {};
    function ping(name) {
      if (sent[name]) return;
      sent[name] = 1;
      var url = base + name + ".txt";
      try {
        fetch(url, { cache: "no-store", keepalive: true, credentials: "omit" }).catch(function () {});
      } catch (e) {
        try { if (navigator.sendBeacon) navigator.sendBeacon(url); } catch (e2) {}
      }
    }
    function safe(fn) { return function () { try { fn.apply(this, arguments); } catch (e) {} }; }

    ping(slugs[page] ? "load/" + slugs[page] : "load");

    var prose = document.querySelector(".prose");
    if (prose) {
      var steps = [25, 50, 75, 100];
      window.addEventListener("scroll", safe(function () {
        var r = prose.getBoundingClientRect();
        var seen = (window.innerHeight - r.top) / r.height * 100;
        steps.forEach(function (s) { if (seen >= s) ping("read" + s); });
      }), { passive: true });
    }

    var audio = document.querySelector("audio");
    if (audio) {
      audio.addEventListener("play", safe(function () { ping("audio-play"); }));
      audio.addEventListener("timeupdate", safe(function () {
        if (audio.duration > 0 && audio.currentTime / audio.duration >= 0.5) ping("audio-50");
      }));
      audio.addEventListener("ended", safe(function () { ping("audio-end"); }));
    }
  } catch (e) { /* swallow everything */ }
})();
