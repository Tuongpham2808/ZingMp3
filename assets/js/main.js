/*
render song
scroll top
play/pause/seek
CD rotate
next/prev
random
next/repeat when ended
active song
scroll active song into view
play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'ZING_MP3';

const courseZingTOP = "https://mp3.zing.vn/xhr/chart-realtime?songId=0&videoId=0&albumId=0&chart=song&time=-1";
const courseMp3 = "https://mp3.zing.vn/xhr/media/get-source?type=audio&key=";

const cd = $('.cd');
const bgImage = $('.bg-image');
const audio = $('#audio');
const heading = $('#nameSong');
const cdThumb = $('.cd-thumb');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const player = $('.player');
const progress = $('#progress');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
// console.log(repeatBtn)
// Set giá trị mặc định
var currIndex = 0;
var isPlaying = false;
var isRandom = false;
var isRepeat = false;
var songListened = [0];
var config = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {};
function setConfig(key, value) {
    config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(config));

}
function getCurrentSong(songs) {
    return songs[currIndex];
}

// songs: [
//     {
//         name: 'Em Nên Dừng Lại',
//         singer: 'Khang Việt',
//         path: './assets/music/song1.mp3',
//         image: './assets/img/song1.png'
//     },
//     {
//         name: 'Ngày Đầu Tiên',
//         singer: 'Đức Phúc',
//         path: './assets/music/song2.mp3',
//         image: './assets/img/song2.png'
//     },
//     {
//         name: 'Muộn Rồi Mà Sao Còn',
//         singer: 'Sơn Tùng MTP',
//         path: './assets/music/song3.mp3',
//         image: './assets/img/song3.png'
//     },
//     {
//         name: 'Để Mị Nói Cho Mà Nghe',
//         singer: 'Hoàng Thùy Linh',
//         path: './assets/music/song4.mp3',
//         image: './assets/img/song4.png'
//     },
//     {
//         name: 'Anh Thanh Niên',
//         singer: 'HuyR',
//         path: './assets/music/song5.mp3',
//         image: './assets/img/song5.png'
//     },
//     {
//         name: 'Đi Về Nhà',
//         singer: 'Đen x JustaTee',
//         path: './assets/music/song6.mp3',
//         image: './assets/img/song6.png'
//     },
// ],

function getSourse(callback) {
    fetch(courseZingTOP)
        .then(function (reponse) {
            return reponse.json();
        })
        .then(function (course) {
            return dataSongs = course.data.song.map(function (sourse) {
                return {
                    id: sourse.id,
                    name: sourse.title,
                    singer: sourse.performer,
                    codeMp3: sourse.code,
                    image: sourse.thumbnail.replace('w94_', 'w1000_'),
                    position: sourse.position
                }
            })
        })
        .then(callback);
}
// Render playlist
function render(songs) {
    const htmls = songs.map((song, index) => {
        return `
            <div class="song${index == currIndex ? ' active' : ''}" data-id='${index}'>
            <div class="thumb" style="background-image:
                url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `
    });
    $('.playlist').innerHTML = htmls.join('');
    // console.log(htmls)

}
//
function getAudio(codeMp3, callback) {
    const linkMp3 = courseMp3 + codeMp3;
    fetch(linkMp3)
        .then(function (reponse) {
            return reponse.json();
        })
        .then(function (course) {
            // console.log(course);
            return path = course.data.source['128'];
        })
        .then(callback);
}

// Tải thông tin bài hát đầu tiên vào giao diện
function loadCurrentSong(songs) {
    const songcurrent = getCurrentSong(songs);
    const codeMp3 = songcurrent.codeMp3;
    // render ra UI
    heading.textContent = songcurrent.name;
    cdThumb.style.backgroundImage = `url('${songcurrent.image}')`;
    bgImage.style.backgroundImage = `url('${songcurrent.image}')`;
    getAudio(codeMp3, function (path) {
        audio.src = path;
        // console.log(path);

        if (isPlaying) {
            audio.pause();
            audio.play();
            player.classList.add('playing');
            cdThumbAnimate.play();
        } else {
            audio.pause();
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
    })
}
function loadConfig() {
    isRandom = config.isRandom;
    isRepeat = config.isRepeat;

    // trạng thái ban đầu của repeat và random
    repeatBtn.classList.toggle('active', isRepeat);
    randomBtn.classList.toggle('active', isRandom);
}

// Xử lý CD quay/ Dừng
const cdThumbAnimate = cdThumb.animate([
    { transform: 'rotate(0)' },
    { transform: 'rotate(359deg)' }
], {
    duration: 10000,
    iterations: Infinity
});
cdThumbAnimate.pause();
// Xử lý backgroundImage cũng quay theo reverse
// const bgImageAnimate = bgImage.animate([
//     { transform: 'rotate(0)' },
//     { transform: 'rotate(359deg)' }
// ], {
//     duration: 10000,
//     iterations: Infinity
// });
// // cdThumbAnimate.reverse();


// Lắng nghe và xử lý các sự kiện
function handleEvents() {

    // Xử lý phóng to thu nhỏ CD
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
        const scollTop = window.scrollY || document.documentElement.scrollTop;
        const newWidth = cdWidth - scollTop;
        // console.log(newWidth)
        cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
        cd.style.opacity = newWidth / cdWidth;
    }

    // Xử lý khi play audio/ pause audio
    playBtn.onclick = function () {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }

    //// Khi bài hát bị pause
    audio.onpause = function () {
        isPlaying = false;
        player.classList.remove('playing');
        cdThumbAnimate.pause();
    }
    //// Khi bài hát được play
    audio.onplay = function () {
        isPlaying = true;
        player.classList.add('playing');
        cdThumbAnimate.play();
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
        if (audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
            progress.value = progressPercent;
        }
        // console.log(audio.currentTime);
    }
    // Xử lý khi tua bài hát
    progress.onchange = function (e) {
        const seekTime = e.target.value * audio.duration / 100;
        audio.currentTime = seekTime;
    }
    // Xử lý next song khi 1 bài nhạc chạy hết
    audio.onended = function () {
        if (isRepeat) {
            audio.pause();
            audio.play();
        } else {
            nextBtn.click();
            isPlaying = true;
            audio.pause();
            audio.play();
            player.classList.add('playing');
            cdThumbAnimate.play();
        };
    };

}
function songActive() {
    const songActive = $('div.song.active');
    const songElement = $$('.song')
    songActive.classList.remove('active');
    songElement.forEach(function (song, index) {
        if (song.getAttribute('data-id') == currIndex) {
            song.classList.add('active');
        };
    });
}
// Kéo bài hát được active lên view
function scrollToActiveSong() {
    setTimeout(() => {
        $('div.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        })
    }, 300)
}
// Next bài tiếp theo
function nextSong(songs) {
    if (isRandom) {
        randomSong(songs);
    } else {
        currIndex++;
        if (currIndex >= songs.length) {
            currIndex = 0;
        }
    }
    songActive();
    loadCurrentSong(songs);
    scrollToActiveSong();
}
// Lùi bài nhạc
function prevSong(songs) {
    if (isRandom) {
        randomSong(songs);
    } else {
        currIndex--;
        if (currIndex < 0) {
            currIndex = songs.length - 1;
        }
    }
    songActive();
    loadCurrentSong(songs);
    scrollToActiveSong();
}
// lấy currIndex ngẫu nhiên
function randomSong(songs) {
    var newIndex;
    do {
        newIndex = Math.floor(Math.random() * songs.length);
    } while (songListened.includes(newIndex));
    currIndex = newIndex;
    songListened.push(newIndex);
    // console.log(songListened);
    if (songListened.length == songs.length) {
        songListened = [];
    }
}
// play bài hát được chọn vào


function start() {
    // Gán cấu hình từ localStorage vào ZING_MP3
    loadConfig();
    getSourse(function (songs) {
        render(songs);
        loadCurrentSong(songs);
        // khi next song
        nextBtn.onclick = function () {
            nextSong(songs);
        };
        // Khi prev song
        prevBtn.onclick = function () {
            prevSong(songs);
        };
        // random song
        randomBtn.onclick = function () {
            isRandom = !isRandom;
            setConfig('isRandom', isRandom);
            randomBtn.classList.toggle('active', isRandom);
        };
        // repeat song
        repeatBtn.onclick = function () {
            isRepeat = !isRepeat;
            setConfig('isRepeat', isRepeat);
            repeatBtn.classList.toggle('active', isRepeat);
        };
        // khi click bài muốn phát
        const listElement = $$('div.song');
        for (var i = 0; i < listElement.length; i++) {
            listElement[i].onclick = function (e) {
                console.log(e.target)
                songElement = e.target.closest('.song:not(.active)');
                if (songElement || e.target.closest('option')) {
                    if (songElement) {
                        currIndex = songElement.getAttribute('data-id');
                        loadCurrentSong(songs);
                        audio.pause();
                        audio.play();
                        songActive();
                    }
                }
            }
        }
    })
    handleEvents();
}

start();
// $('#audio').play();