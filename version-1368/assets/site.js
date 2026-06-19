(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupCarousel() {
        var slider = document.querySelector("[data-carousel]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupViewButtons() {
        var groups = document.querySelectorAll("[data-view-target]");
        if (!groups.length) {
            return;
        }
        document.querySelectorAll(".view-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                var mode = button.getAttribute("data-view");
                document.querySelectorAll(".view-btn").forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                groups.forEach(function (group) {
                    group.classList.toggle("list-view", mode === "list");
                });
            });
        });
    }

    function setupSearch() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var genre = document.querySelector("[data-genre-filter]");
        var year = document.querySelector("[data-year-filter]");
        var results = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        if (!form || !input || !results) {
            return;
        }
        var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function haystack(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" "));
        }

        function applyFilters() {
            var q = normalize(input.value);
            var g = normalize(genre ? genre.value : "");
            var y = normalize(year ? year.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = haystack(card);
                var passQuery = !q || text.indexOf(q) !== -1;
                var passGenre = !g || text.indexOf(g) !== -1;
                var passYear = !y || normalize(card.dataset.year) === y;
                var show = passQuery && passGenre && passYear;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (status) {
                status.textContent = visible ? "已筛选出匹配影片。" : "没有匹配的影片。";
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var next = new URL(window.location.href);
            if (input.value.trim()) {
                next.searchParams.set("q", input.value.trim());
            } else {
                next.searchParams.delete("q");
            }
            window.history.replaceState(null, "", next.toString());
            applyFilters();
        });
        [input, genre, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    }

    function setupPlayers() {
        document.querySelectorAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-layer");
            if (!video || !button) {
                return;
            }
            var loaded = false;
            var hlsInstance = null;
            var stream = video.getAttribute("data-stream");

            function playVideo() {
                if (!stream) {
                    return;
                }
                if (!loaded) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                        loaded = true;
                        video.play().catch(function () {});
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                        loaded = true;
                    } else {
                        video.src = stream;
                        loaded = true;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
                shell.classList.add("is-playing");
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("ended", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupCarousel();
        setupViewButtons();
        setupSearch();
        setupPlayers();
    });
})();
