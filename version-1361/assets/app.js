(function () {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let activeIndex = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot));
                start();
            });
        });

        start();
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query) {
            filterInput.value = query;
        }

        const items = Array.from(filterList.querySelectorAll('.movie-card'));

        const applyFilter = function () {
            const keyword = filterInput.value.trim().toLowerCase();
            const year = yearFilter ? yearFilter.value : '';

            items.forEach(function (item) {
                const haystack = [
                    item.dataset.title,
                    item.dataset.year,
                    item.dataset.region,
                    item.dataset.genre,
                    item.dataset.tags
                ].join(' ').toLowerCase();

                const keywordMatched = !keyword || haystack.includes(keyword);
                const yearMatched = !year || item.dataset.year === year;
                item.classList.toggle('is-hidden', !(keywordMatched && yearMatched));
            });
        };

        filterInput.addEventListener('input', applyFilter);

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }

        applyFilter();
    }
})();
