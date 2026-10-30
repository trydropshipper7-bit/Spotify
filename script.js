let songs = [];
let currIndex = 0;
let currentAudio = null;
let currFolder = "pc"; 

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/songs/${folder}/`);
    let response = await a.text();
    
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        if (element.href.endsWith(".webm") || element.href.endsWith(".mp3")) {
            let songName = element.href.split(`/${folder}/`)[1];
            songs.push(decodeURIComponent(songName));
        }
    }
    return songs;
}

function lictmaker(songsList) {
    let liarea = document.getElementsByClassName("ml")[0].getElementsByTagName("ul")[0];
    liarea.innerHTML = ""; 
    
    songsList.forEach((song, index) => {
        let cleanName = song.replace(/\.(webm|mp3)$/i, "");

        liarea.innerHTML += `
            <li data-index="${index}">
                <img class="verter" src="img/music.svg" alt="">
                <div class="song-info">
                    <div class="song-name">${cleanName}</div>
                    <div class="artist-name">Unknown Artist</div>
                </div>
                <svg class="list-play-btn" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
                </svg>
            </li>
        `;
    });

    // Library list ke items par click event lagana
    Array.from(document.getElementsByClassName("ml")[0].getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let index = parseInt(e.getAttribute("data-index"));
            playMusic(index);
        });
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}

function playMusic(index) {
    if (index < 0 || index >= songs.length) return;
    currIndex = index;
    let track = songs[currIndex];

    // Agar pehle se koi audio chal raha hai toh usay rokar completely reset karein
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio(`/songs/${currFolder}/` + track);
    currentAudio.play();

    let playBtn = document.getElementById("plm");
    if (playBtn) playBtn.src = "img/pause.svg";

    let songInfoDiv = document.querySelector(".songinfo"); 
    if (songInfoDiv) {
        songInfoDiv.innerText = track.replace(/\.(webm|mp3)$/i, "");
    }

    currentAudio.addEventListener("timeupdate", () => {
        let currentTime = currentAudio.currentTime;
        let duration = currentAudio.duration;

        let timeDisplay = document.querySelector(".songtime");
        if (timeDisplay && duration) {
            timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }

        let circle = document.querySelector(".circle");
        if (circle && duration) {
            let progressPercent = (currentTime / duration) * 100;
            circle.style.left = progressPercent + "%";
        }
    });

    currentAudio.onended = () => {
        if (currIndex + 1 < songs.length) {
            playMusic(currIndex + 1);
        } else {
            playMusic(0);
        }
    };
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardct");
    cardContainer.innerHTML = ""; 

    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        
        if (element.href.includes("/songs/")) {
            let hrefParts = element.href.split("/songs/");
            let folder = hrefParts[1] ? hrefParts[1].replace(/\//g, "") : "";
            
            if (folder) {
                try {
                    let infoReq = await fetch(`/songs/${folder}/info.json`);
                    let infoRes = await infoReq.json();
                    
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card pr">
                            <svg class="play paq" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64"/>
                                <path d="M9.5 8L16 12L9.5 16V8Z" fill="#000000"/>
                            </svg>
                            <img class="azir" src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${infoRes.title}</h2>
                            <p>${infoRes.description}</p>
                        </div>`;
                } catch (error) {
                    console.log(`Folder ${folder} mein info.json nahi mila.`);
                }
            }
        }
    }

    // Card click event (Jab naya album/playlist click ho)
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folderName = e.dataset.folder;
            if (folderName) {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }

                let playBtn = document.getElementById("plm");
                if (playBtn) playBtn.src = "img/play.svg";

                songs = await getSongs(folderName);
                lictmaker(songs);
                
                if (songs.length > 0) {
                    let songInfoDiv = document.querySelector(".songinfo");
                    if (songInfoDiv) {
                        songInfoDiv.innerText = songs[0].replace(/\.(webm|mp3)$/i, "");
                    }
                }

                let leftMenu = document.querySelector(".left");
                if (leftMenu) {
                    leftMenu.style.left = "0%";
                }
            }
        });
    });

    // Cards Hover Effects
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("mouseover", () => {
            let playBtn = card.querySelector(".play");
            if (playBtn) {
                playBtn.style.top = "158px";
                playBtn.style.opacity = "1";
            }
        });

        card.addEventListener("mouseout", () => {
            let playBtn = card.querySelector(".play");
            if (playBtn) {
                playBtn.style.top = "255px";
                playBtn.style.opacity = "0";
            }
        });
    });
}

async function main() {
    await displayAlbums();

    await getSongs("pc");
    if (songs.length > 0) {
        lictmaker(songs);
        let songInfoDiv = document.querySelector(".songinfo");
        if (songInfoDiv) {
            songInfoDiv.innerText = songs[0].replace(/\.(webm|mp3)$/i, "");
        }
    }

    let hamburger = document.querySelector(".hmi");
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            let leftMenu = document.querySelector(".left");
            if (leftMenu) {
                leftMenu.style.left = "0%";
            }
        });
    }

    let closeBtn = document.querySelector(".cl");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            let leftMenu = document.querySelector(".left");
            if (leftMenu) {
                leftMenu.style.left = "-100%";
            }
        });
    }

    let playBtn = document.getElementById("plm");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (!currentAudio) {
                playMusic(0);
            } else if (currentAudio.paused) {
                currentAudio.play();
                playBtn.src = "img/pause.svg";
            } else {
                currentAudio.pause();
                playBtn.src = "img/play.svg";
            }
        });
    }

    let prevBtn = document.getElementById("pmm");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currIndex > 0) {
                playMusic(currIndex - 1);
            } else {
                playMusic(songs.length - 1);
            }
        });
    }

    let nextBtn = document.getElementById("mlm");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currIndex + 1 < songs.length) {
                playMusic(currIndex + 1);
            } else {
                playMusic(0);
            }
        });
    }

    let seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", (e) => {
            if (!currentAudio) return;
            let seekbarWidth = seekbar.getBoundingClientRect().width;
            let clickX = e.offsetX;
            let percent = (clickX / seekbarWidth);
            currentAudio.currentTime = percent * currentAudio.duration;
        });
    }

    let volumeSlider = document.querySelector(".volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            if (currentAudio) {
                currentAudio.volume = e.target.value / 100;
            }
        });
    }
}

main();