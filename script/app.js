// API LINK - https://api.nasa.gov/

const URL = "https://api.nasa.gov";
const KEY = "kmHvUJbYjOUIAfWhglmO4dZekvZ1AOWhTnaWL560"; // TODO: HIDE KEY

// -------------------------

const loading = document.querySelector(".loading-effect")

// apod page
const todayDate = new Date().toLocaleDateString('en-CA')
const inputDate = document.querySelector(".date-input");
const apodBtn = document.querySelector("#APOD-btn");

// mars page
const camWrapper = document.querySelector(".cam-wrapper");
const marsBtn = document.querySelector("#mars-btn");
const roverSelect = document.querySelector(".rover-select");
const camSelect = document.querySelector(".cam-select");

// search page
const mediaSelect = document.querySelector(".media-select");
const searchInput = document.querySelector(".search-bar-input");
const searchBtn = document.querySelector("#search-btn");
const moreBtn = document.querySelector("#more-btn");
const clearBtn = document.querySelector("#clear-btn");
const searchedItemContainer = document.querySelector(".searched-item-wrapper")
let isEventListenerAdded = false;
let objIndex = 0;
let searchLimit = 5;

// -------------------------

// Main Data Fetch
async function getData(FULL_URL){
    try{
        const response = await fetch(FULL_URL);
        
        if (!response.ok || (response.status < 200 || response.status > 299)){
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();

    } catch(e){
        console.error(`Expected Error Occured: ${e}`);
    } 
};

// -------------------------

// add comment here
function loadingEffect(delay){
    loading.classList.add("state")
    setTimeout(() => { loading.classList.remove("state") }, delay)
}

// Update APOD UI
function updateAPOD(data){
    const {copyright, date, explanation, hdurl, title, url} = data;

    document.querySelector(".APOD-img").src = url;
    document.querySelector(".APOD-link").setAttribute("href",`${hdurl}`);
    document.querySelector(".APOD-date").innerHTML = date;
    document.querySelector(".APOD-title").innerHTML = title;
    document.querySelector(".APOD-desc").innerHTML = explanation;
    document.querySelector(".APOD-copyright").innerHTML = copyright ? copyright: "stated on image...";
}

// get Astronomy Picture of the Day (APOD)
async function getAPOD(ENDPOINT){
    loadingEffect(2000);

    const dataAPI = await getData(ENDPOINT);

    Array.isArray(dataAPI) ? updateAPOD(dataAPI[0]) : updateAPOD(dataAPI);

    // await FILEreadAPODS(dataAPI);
}

// add comment here
if(apodBtn){
    apodBtn.addEventListener("click", async function() {
        const valueDate = inputDate.value;
    
        if(valueDate > todayDate){
            alert("Date can't be in the future!")
        } else if(valueDate < "1995-06-16"){
            alert("Date can't be before June 16th 1995!")
        } else {
            getAPOD(`${URL}/planetary/apod?start_date=${valueDate}&end_date=${valueDate}&api_key=${KEY}`)
            return; 
        }
        inputDate.value = todayDate;
    })
}

// -------------------------

// add comment here
function roverAlert() {
    alert("Please choose a rover first!");
}

// add comment here
if(camWrapper){
    camWrapper.addEventListener("click", roverAlert);
}

// add comment here
function addCamOptions(array){
    camSelect.innerHTML = "";
    camSelect.innerHTML = '<option value="" disabled selected>Choose camera...</option>';

    array.forEach((op) => camSelect.innerHTML += `<option value=${op}>${op}</option>`);
}

// add comment here
if(roverSelect){
    roverSelect.addEventListener("change", function(){
        const camOptions1 = ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"];
        const camOptions2 = ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"];

        if((roverSelect.value === "curiosity") && (camSelect.children.length !== camOptions1.length+1)){
            addCamOptions(camOptions1);
        } else if((roverSelect.value === "spirit" || roverSelect.value === "opportunity") && (camSelect.children.length !== camOptions2.length+1)){
            addCamOptions(camOptions2);
        };

        camWrapper.style.cursor = "auto";
        camSelect.style.pointerEvents = "auto";
        camWrapper.removeEventListener("click", roverAlert);
    });
}

// add comment here
function updateMars(data){
    const {camera:{full_name}, rover:{name, launch_date, landing_date}, sol, earth_date, img_src} = data;

    document.querySelector(".mars-img").src = img_src;
    document.querySelector(".mars-link").setAttribute("href", img_src)

    document.querySelector(".mars-rover-name").innerHTML = name;
    document.querySelector(".mars-cam-name").innerHTML = data.camera.name;
    document.querySelector(".mars-cam-fn").innerHTML = `"${full_name}"`;
    document.querySelector(".mars-cover-lauch-date").innerHTML = launch_date;
    document.querySelector(".mars-cover-landing-date").innerHTML = landing_date;
    document.querySelector(".mars-earth-date").innerHTML = earth_date;
    document.querySelector(".mars-sol-date").innerHTML = sol;

    document.querySelector(".mars-section .container:first-child").style.minHeight = "auto";
    document.querySelector(".mars-info-container").style.display = "block";
    document.querySelector(".mars-section .heading").style.marginTop = "0";
}

// add comment here
async function getMars(rover, cam){
    loadingEffect(3500);

    let photosData;
    const manifestData = await getData(`${URL}/mars-photos/api/v1/manifests/${rover}/?api_key=${KEY}`);

    while(true){
        const randomSolNum = Math.floor(Math.random() * Number(manifestData.photo_manifest.max_sol));
        photosData = await getData(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${randomSolNum}&camera=${cam.toLowerCase()}&api_key=kmHvUJbYjOUIAfWhglmO4dZekvZ1AOWhTnaWL560`);

        if(photosData.photos.length !== 0) break;
    }
    const randomPhotoNum =  Math.floor(Math.random() * photosData.photos.length);

    updateMars(photosData.photos[randomPhotoNum]);
}

// add comment here
if(marsBtn){
    marsBtn.addEventListener("click", function(){
        const roverVal = roverSelect.value
        const camVal = camSelect.value; 

        if(!roverVal){
            alert("Please choose a rover!")
        } else if(!camVal){
            alert("Please choose a camera!")
        } else {
            getMars(roverVal, camVal)
        }
    });
}

// -------------------------

// add comment here
function updateUI(mediItem){
    searchedItemContainer.innerHTML += mediItem; 
}

// add comment here
function checkResult(data){
    const noResutsTitle = document.querySelector(".search-section h3");

    console.log(searchInput.value)

    if(data.length === 0){
        noResutsTitle.style.display = "block";
        searchInput.value = "";
        alert("No results found!")
        return true;
    }
    noResutsTitle.style.display = "none";
    clearBtn.style.display = "block"

    return false;
}

// add comment here
async function iterateMedia(data, format){
    const allItems = data.collection.items;
    const slicedItems = allItems.slice(objIndex, (allItems.length < searchLimit ? allItems.length : searchLimit) + objIndex);
    const remainingItems = [...allItems].splice(searchLimit + objIndex)

    if(checkResult(slicedItems)) return;

    const mediaVal = mediaSelect.value;

    for(let i of slicedItems){
        const mediaResponse = await getData(i.href);
        let mediaSource = mediaResponse.find((m) => format.test(m)).trim();
   
        mediaVal === "image" 
        ? updateUI(`<a class="image-wrapper-link" title="View Full Image" href="${mediaSource}" target="_blank"><img src="${mediaSource}"></a>`) 
        : updateUI(`<${mediaVal} controls><source src="${mediaSource}"></source></${mediaVal}>`)
    }

    if (remainingItems.length > searchLimit) moreBtn.style.display = "block";

    if (moreBtn && !isEventListenerAdded) {
        moreBtn.addEventListener("click", function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            moreBtn.style.display = "none";
            objIndex += searchLimit;
            iterateMedia(data, format);
        });
        isEventListenerAdded = true;
    }
}

// add comment here
async function updateAudioMedia(data){
    const validAudioFormats = /\.(mp3|wav|ogg|m4a)$/i;

    iterateMedia(data, validAudioFormats)
}

// add comment here
async function updateImageMedia(data){
    const validImageFormats = /\.(jpg|jpeg|jpe|jif|jfif|jfi|png|avif|gif|svg|webp)$/i;
    
    iterateMedia(data, validImageFormats)
}

// add comment here
async function updateVideoMedia(data){
    const validVideoFormats = /\.(mp4|webm|ogg)$/i;

    iterateMedia(data, validVideoFormats)
}

// add comment here
function checkType(data, mediaVal){
    switch (mediaVal) {
        case "image":
            updateImageMedia(data)
          break;
        case "video":
            updateVideoMedia(data)
          break;
        case "audio":
            updateAudioMedia(data)
          break;
        default:
          break;
      }
}

// add comment here
async function getSearch(searchVal, mediaVal){
    const data = await getData(`https://images-api.nasa.gov/search?q=${searchVal}-planet&media_type=${mediaVal}`)

    checkType(data, mediaVal)
}

// add comment here
if(searchBtn){
    searchBtn.addEventListener("click", function(){
        const searchInputVal = searchInput.value;
        const mediaVal = mediaSelect.value;

        if(!searchInputVal){
            alert("Search input is empty!");
        }else if(!mediaVal){
            alert("Please choose a media!");
        } else{
            objIndex = 0;
            searchedItemContainer.innerHTML = "";
            moreBtn.style.display = "none"
            getSearch(searchInputVal, mediaVal);
        }
    })
}

// add comment here
if(clearBtn){
    clearBtn.addEventListener("click", function(){
        searchedItemContainer.innerHTML = "";
        clearBtn.style.display = "none"
        moreBtn.style.display = "none"
    })
}

// ----------

// add comment here
document.addEventListener("DOMContentLoaded", () => {
    inputDate.setAttribute("value", todayDate);
    inputDate.setAttribute("max", todayDate);

    getAPOD(`${URL}/planetary/apod?api_key=${KEY}`);
})


// // TODO: READ AND WRITE INTO previous-ADPODs.json 
// // CHECK IF DATA.NAME ALREAD EXISTS AS KEY IN FILE THAT IS JSON MAP
// // ELSE NOT THEN ADD DATA TO MAP WITH KEY BEING NAME AND VALUE BEING OBJECT

// function FILEiterateAPODS(jsonData){
//     // iterate through jsonData and update dom with its data
// }

// function FILEwriteAPODS(data){
//     // write new object into the file
//     // may read into file and new obj in. or replace file with map 
// }

// async function FILEreadAPODS(data){
//     const jsonData = await getData("../json/previous-APODs.json");
//     const {date, hdurl, title, url} = data;
//     if(!jsonData.hasOwnProperty(title)){
//         jsonData[title] = {"date": date, "url": url, "hdurl": hdurl}
//         FILEwriteAPODS(data);
//     } 
//     FILEiterateAPODS(jsonData)
// };