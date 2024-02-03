var currentSong = new Audio()
let play = document.getElementById('play')
let songs;
let currFolder;
function secondsToMinutes(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        return 'Invalid input';
    }

    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    console.log(`/${folder}/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songsUl = document.querySelector('.songList').getElementsByTagName('ul')[0]
    songsUl.innerHTML = ""
    for (const i of songs) {
        songsUl.innerHTML += `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${i.replaceAll('%20', ' ')}</div>
            <div>${i.replaceAll('%20', ' ').split('-')[1]}</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
        </li>`;
    }

    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML);
            playMusic(e.querySelector('.info').firstElementChild.innerHTML)
        })
    })
    return songs
}
function playMusic(songName, paused = false) {
    currentSong.src = `/${currFolder}/` + songName
    if (!paused) {
        currentSong.play()
        play.src = 'pause.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(songName)
    document.querySelector('.songtime').innerHTML = '00:00/00:00'
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split('/').slice(-2)[0];
            let a = await fetch(`songs/${folder}/info.json`)
            let res = await a.json()
            console.log(res);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                        fill="black" class="injected-svg"
                        data-src="https://hugeicons.storage.googleapis.com/icons/play-stroke-sharp.svg?type=svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#fffffff">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5"
                            stroke-linejoin="round"></path>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg">
                <h2>${res.title}</h2>
                <p>${res.description}</p>
            </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async (e) => {
            songs = await getSongs(`songs/${e.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
    // console.log(div);
}
async function main() {

    await getSongs(`songs/animal`)
    playMusic(songs[0], true)

    displayAlbums()

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = 'pause.svg'
        } else {
            currentSong.pause()
            play.src = 'play.svg'
        }
    })
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent + '%'
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })
    document.querySelector('.ham').addEventListener('click', () => {
        document.querySelector('.left').style.left = 0
    })
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-100%';
    })
    let prev = document.getElementById('prev')
    let nect = document.getElementById('nect')
    prev.addEventListener('click', () => {
        let indexOfSong = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (indexOfSong >= 1) {
            playMusic(songs[indexOfSong - 1])
        }
    })
    next.addEventListener('click', () => {
        let indexOfSong = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (indexOfSong <= songs.length) {
            playMusic(songs[indexOfSong + 1])
        }
    })
    document.querySelector('.volume').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target.src);
        if (e.target.src.includes("vol.svg")) {
            e.target.src = e.target.src.replace("vol.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").value = 0
        } else {
            currentSong.volume = .10;
            e.target.src = e.target.src.replace("mute.svg", "vol.svg")
            document.querySelector(".range").value = 10
        }
    })
}
main()
