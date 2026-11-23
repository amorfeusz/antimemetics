/* Privacy-respecting engagement events for GoatCounter. No cookies, no IDs.
   Sends at most a handful of anonymous counts per page view. */
(function () {
  var page = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
  var sent = {};
  function send(name, tries) {
    if (sent[name]) return;
    tries = tries || 0;
    if (tries > 30) return; // blocked or offline: give up quietly
    var gc = window.goatcounter;
    if (!gc || !gc.count) { sent[name] = "pending"; setTimeout(function () { sent[name] = false; send(name, tries + 1); }, 1000); return; }
    sent[name] = true;
    gc.count({ path: page + " · " + name, title: name, event: true });
  }
  // Time actually visible (tab in foreground), not just open.
  var marks = [[30, "30s"], [60, "1 min"], [300, "5 min"], [900, "15 min"]];
  var shown = 0;
  setInterval(function () {
    if (document.visibilityState !== "visible") return;
    shown += 5;
    marks.forEach(function (m) { if (shown >= m[0]) send("visible " + m[1]); });
  }, 5000);
  // Reading depth on the long draft pages.
  var prose = document.querySelector(".prose");
  if (prose) {
    var steps = [25, 50, 75, 100];
    window.addEventListener("scroll", function () {
      var r = prose.getBoundingClientRect();
      var seen = (window.innerHeight - r.top) / r.height * 100;
      steps.forEach(function (s) { if (seen >= s) send("read " + s + "%"); });
    }, { passive: true });
  }
})();
