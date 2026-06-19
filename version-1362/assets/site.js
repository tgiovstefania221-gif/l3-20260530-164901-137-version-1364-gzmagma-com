
import { H as Hls } from "./hls-vendor.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    setupMobileMenu();
    setupHeroCarousel();
    setupHorizontalScroll();
    setupFilters();
    setupPlayers();
});

function setupMobileMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", () => {
        panel.classList.toggle("is-open");
    });
}

function setupHeroCarousel() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5000);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    prev?.addEventListener("click", () => {
        show(current - 1);
        start();
    });

    next?.addEventListener("click", () => {
        show(current + 1);
        start();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
}

function setupHorizontalScroll() {
    document.querySelectorAll("[data-horizontal-scroll]").forEach((scroller) => {
        const section = scroller.closest(".section-block");
        const left = section?.querySelector("[data-scroll-left]");
        const right = section?.querySelector("[data-scroll-right]");

        left?.addEventListener("click", () => {
            scroller.scrollBy({ left: -420, behavior: "smooth" });
        });

        right?.addEventListener("click", () => {
            scroller.scrollBy({ left: 420, behavior: "smooth" });
        });
    });
}

function setupFilters() {
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    if (cards.length === 0) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const input = document.querySelector("[data-filter-input]");
    const category = document.querySelector("[data-filter-category]");
    const type = document.querySelector("[data-filter-type]");
    const year = document.querySelector("[data-filter-year]");
    const count = document.querySelector("[data-visible-count]");

    if (input && params.get("q")) {
        input.value = params.get("q");
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const apply = () => {
        const query = normalize(input?.value);
        const categoryValue = normalize(category?.value);
        const typeValue = normalize(type?.value);
        const yearValue = normalize(year?.value);
        let visible = 0;

        cards.forEach((card) => {
            const keywords = normalize(card.dataset.keywords);
            const cardCategory = normalize(card.dataset.category);
            const cardType = normalize(card.dataset.type);
            const cardYear = normalize(card.dataset.year);
            const matchesQuery = !query || keywords.includes(query);
            const matchesCategory = !categoryValue || cardCategory === categoryValue;
            const matchesType = !typeValue || cardType.includes(typeValue);
            const matchesYear = !yearValue || cardYear.includes(yearValue);
            const shouldShow = matchesQuery && matchesCategory && matchesType && matchesYear;
            card.classList.toggle("is-hidden", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }
    };

    [input, category, type, year].forEach((control) => {
        control?.addEventListener("input", apply);
        control?.addEventListener("change", apply);
    });

    apply();
}

function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach((container) => {
        const video = container.querySelector("video[data-src]");
        const overlay = container.querySelector("[data-player-overlay]");
        if (!video || !overlay) {
            return;
        }

        let hlsInstance = null;
        let initialized = false;

        const initialize = () => {
            if (initialized) {
                return;
            }
            initialized = true;

            const source = video.dataset.src;
            if (!source) {
                showPlayerError(container, "播放地址缺失");
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                    if (data?.fatal) {
                        showPlayerError(container, "视频加载失败，请稍后重试");
                        hlsInstance.destroy();
                    }
                });
                return;
            }

            showPlayerError(container, "当前浏览器暂不支持 HLS 播放");
        };

        const play = async () => {
            initialize();
            try {
                await video.play();
                overlay.classList.add("is-hidden");
            } catch (error) {
                overlay.classList.remove("is-hidden");
            }
        };

        overlay.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", () => overlay.classList.add("is-hidden"));
        video.addEventListener("pause", () => overlay.classList.remove("is-hidden"));
        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function showPlayerError(container, message) {
    const overlay = container.querySelector("[data-player-overlay]");
    if (overlay) {
        overlay.innerHTML = `<strong>${message}</strong>`;
        overlay.classList.remove("is-hidden");
    }
}
