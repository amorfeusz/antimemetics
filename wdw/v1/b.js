/* WebDataWeaver beacon v1. Managed by WebDataWeaver; copy verbatim, do not edit. */
(function () {
  try {
    var BASE = '/wdw/v1/';
    var path = location.pathname || '/';
    var slug;
    if (path === '/' || path === '') {
      slug = 'index';
    } else {
      slug = path.replace(/^\/+/, '')
                 .replace(/\.html?$/i, '')
                 .replace(/\/index$/i, '')
                 .replace(/\/+$/, '')
                 .toLowerCase()
                 .replace(/[^a-z0-9_-]+/g, '-') || 'index';
    }
    var sent = {};
    function send(ev) {
      if (sent[ev]) return;
      sent[ev] = 1;
      var url = BASE + slug + '/' + ev + '.txt';
      try {
        if (window.fetch) {
          fetch(url, { cache: 'no-store', keepalive: true, credentials: 'omit' })
            .catch(function () {});
        } else if (navigator.sendBeacon) {
          navigator.sendBeacon(url);
        }
      } catch (e) {}
    }
    window.wdw = send;
    send('load');

    var marks = [25, 50, 75, 100];
    function depth() {
      try {
        var d = document.documentElement, b = document.body;
        var max = Math.max(d.scrollHeight, b ? b.scrollHeight : 0) - window.innerHeight;
        if (max <= 0) return;
        var pct = ((window.scrollY || d.scrollTop || 0) / max) * 100;
        for (var i = 0; i < marks.length; i++) {
          if (pct >= marks[i] - 0.5) send('read' + marks[i]);
        }
      } catch (e) {}
    }
    var timer;
    window.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(depth, 250);
    }, { passive: true });

    function hookAudio(a) {
      if (a.__wdw) return;
      a.__wdw = 1;
      a.addEventListener('play', function () { send('audio-play'); });
      a.addEventListener('timeupdate', function () {
        if (a.duration && a.currentTime / a.duration >= 0.5) send('audio-50');
      });
      a.addEventListener('ended', function () { send('audio-end'); });
    }
    function scanAudio() {
      var list = document.querySelectorAll('audio');
      for (var i = 0; i < list.length; i++) hookAudio(list[i]);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanAudio);
    } else {
      scanAudio();
    }
  } catch (e) {}
})();
