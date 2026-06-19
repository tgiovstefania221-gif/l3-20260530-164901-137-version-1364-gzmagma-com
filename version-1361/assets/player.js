import { H as Hls } from './hls-vendor.js';

const initPlayer = function (video) {
    const source = video.dataset.hlsSrc;
    const wrapper = video.closest('.player-card');
    const playButton = wrapper ? wrapper.querySelector('[data-play-button]') : null;

    if (!source) {
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                wrapper && wrapper.classList.remove('is-playing');
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    }

    const play = function () {
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                wrapper && wrapper.classList.remove('is-playing');
            });
        }
    };

    if (playButton) {
        playButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        wrapper && wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        wrapper && wrapper.classList.remove('is-playing');
    });
};

document.querySelectorAll('.hls-player').forEach(initPlayer);

document.querySelectorAll('[data-scroll-player]').forEach(function (button) {
    button.addEventListener('click', function () {
        const player = document.querySelector('.hls-player');

        if (player) {
            player.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            window.setTimeout(function () {
                player.play();
            }, 360);
        }
    });
});
