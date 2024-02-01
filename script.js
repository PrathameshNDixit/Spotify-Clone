var currentSong = new Audio()
let play = document.getElementById('play')
let songs;

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

function playMusic(songName, paused = false) {
    currentSong.src = '/songs/' + songName
    if (!paused) {
        currentSong.play()
        play.src = 'pause.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(songName)
    document.querySelector('.songtime').innerHTML = '00:00/00:00'
}
async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split('/songs/')[1])
        }
    }
    return songs
}
async function main() {

    songs = await getSongs()
    playMusic(songs[0], true)
    let songsUl = document.querySelector('.songList').getElementsByTagName('ul')[0]
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
    let prev=document.getElementById('prev')
    let nect=document.getElementById('nect')
    prev.addEventListener('click',()=>{
        let indexOfSong=songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if(indexOfSong >= 1){
            playMusic(songs[indexOfSong-1])
        }
    })
    next.addEventListener('click',()=>{
        let indexOfSong=songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if(indexOfSong <= songs.length){
            playMusic(songs[indexOfSong+1])
        }
    })
    document.querySelector('.volume').getElementsByTagName('input')[0].addEventListener('change',(e)=>{
        currentSong.volume=parseInt(e.target.value)/100
    })
}
main()
