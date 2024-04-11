console.log("Hello");
let currentSong = new Audio();
let songs;
let currentFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder)
{
    currentFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
     songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3"))
        {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in the library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="./assets/images/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>

        </div>
        <div class="playnow">
          <span>Play Now</span>
        <img src="./assets/images/play.svg" alt="">
        </div>
      </li>`;
    } 
    // attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>
    {
        e.addEventListener("click",element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        });
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("assets/songs/" + track);
    currentSong.src = `/${currentFolder}/` + track;
    if(!pause)
    {
        currentSong.play();
        play.src = "assets/images/pause.svg";
        
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    
}
async function displayAlbums()
{
    let a = await fetch("/Spotify-Clone/tree/main/assets/songs");
    let response = await a.text();
    let cardContainer = document.querySelector(".cardContainer");

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes("/songs/"))
        {
            let folder = e.href.split("/").slice(-1)[0];
            // get metadata of the folder
            let a = await fetch(`/Spotify-Clone/tree/main/assets/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play"><img class="invert" src="./assets/images/play.svg" alt="Play Button"></div>
            <img src="./assets/songs/${folder}/cover.jpg" alt="${folder}">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
        }
    };
    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item =>{
            songs = await getSongs(`assets/songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    });
}

async function main()
{

    //get list of all the songs added
    await getSongs("assets/songs/diljit");
    playMusic(songs[0], true);

    // display all the albums on the page
    displayAlbums();
    
    
     
    //attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused)
        {
            currentSong.play();
            play.src = "assets/images/pause.svg";
        }
        else
        {
            currentSong.pause();
            play.src = "assets/images/play.svg";
        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () =>
    {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percentage = (e.offsetX/e.target.getBoundingClientRect().width) * 100 + "%"
        document.querySelector(".circle").style.left = percentage;
        currentSong.currentTime = (currentSong.duration * parseFloat(percentage)) / 100;
    })
    
    // add an eventListener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //add an eventlistener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener for previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index == 0)
        {
            playMusic(songs[(songs.length) - 1]);
        }
        else
        {
            playMusic(songs[index - 1]);
        }
    });   
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index == songs.length - 1)
        {
            playMusic(songs[0]);
        }
        else
        {
            playMusic(songs[index  + 1]);
        }
    });    

    // add an event for volume change 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to", e.target.value);
        // removing mute image if volume is not 0
        if(e.target.value != 0)
        {
            document.querySelector(".volume img").src = "assets/images/volume.svg";
        }
        currentSong.volume = parseInt(e.target.value)/100;
    });
    
    // add mute option
    document.querySelector(".volume img").addEventListener("click", e =>{
        if(e.target.src == "/Spotify-Clone/tree/main/assets/images/volume.svg")
        {
            e.target.src = "assets/images/mute.svg"
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else
        {
            e.target.src = "assets/images/volume.svg"
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
    
    
}

main();
