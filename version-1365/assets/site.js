(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    hydrateSearchQuery();
  });

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-card-search]');
      var scopes = Array.prototype.slice.call(panel.querySelectorAll('.filter-chips'));
      var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
      var empty = document.querySelector('[data-no-results]');
      var active = {};

      scopes.forEach(function (scope) {
        var key = scope.getAttribute('data-filter-key');
        active[key] = 'all';
        scope.addEventListener('click', function (event) {
          var chip = event.target.closest('[data-filter-value]');
          if (!chip) {
            return;
          }
          active[key] = chip.getAttribute('data-filter-value');
          Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]')).forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedChips = Object.keys(active).every(function (key) {
            return active[key] === 'all' || card.getAttribute('data-' + key) === active[key];
          });
          var matched = matchedKeyword && matchedChips;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
    });
  }

  function hydrateSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    var input = document.querySelector('[data-card-search]');
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-video-url');
      var attached = false;
      var hls = null;

      if (!video || !cover || !source) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            cover.classList.remove('is-hidden');
          });
        }
      }

      cover.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }
})();
