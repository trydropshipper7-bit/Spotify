async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardct");
    cardContainer.innerHTML = ""; // Container ko khali karna

    for (let index = 0; index < anchors.length; index++) {
        const element = anchors[index];
        
        if (element.href.includes("/songs/")) {
            // Folder ka naam saaf tareeqay se nikalne ke liye split aur filter
            let hrefParts = element.href.split("/songs/");
            let folder = hrefParts[1] ? hrefParts[1].replace(/\//g, "") : "";
            
            if (folder) {
                try {
                    // Har folder ki info.json fetch karna
                    let infoReq = await fetch(`/songs/${folder}/info.json`);
                    let infoRes = await infoReq.json();
                    
                    // Card container mein dynamic cover, title aur description inject karna
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card pr">
                            <svg class="play paq" width="50" height="50" viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"
                                text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd"
                                clip-rule="evenodd">
                                <circle fill="#01A437" cx="256" cy="256" r="256" />
                                <path fill="#42C76E"
                                    d="M256 9.28c136.12 0 246.46 110.35 246.46 246.46 0 3.22-.08 6.42-.21 9.62C497.2 133.7 388.89 28.51 256 28.51S14.8 133.7 9.75 265.36c-.13-3.2-.21-6.4-.21-9.62C9.54 119.63 119.88 9.28 256 9.28z" />
                                <path fill="#fff"
                                    d="M351.74 275.46c17.09-11.03 17.04-23.32 0-33.09l-133.52-97.7c-13.92-8.73-28.44-3.6-28.05 14.57l.54 191.94c1.2 19.71 12.44 25.12 29.04 16l131.99-91.72z" />
                            </svg>
                            <img class="azir" src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${infoRes.title}</h2>
                            <p>${infoRes.description}</p>
                        </div>`;
                } catch (error) {
                    console.log(`Folder ${folder} mein info.json ya cover load nahi ho saka.`);
                }
            }
        }
    }

    // Dynamic cards par click event lagana taake album select ho sakay
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folderName = e.dataset.folder;
            if (folderName) {
                songs = await getSongs(folderName);
                lictmaker(songs);
                if (songs.length > 0) {
                    let songInfoDiv = document.querySelector(".songinfo");
                    if (songInfoDiv) {
                        songInfoDiv.innerText = songs[0].replace(/\.(webm|mp3)$/i, "");
                    }
                }
            }
        });
    });
}