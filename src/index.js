// define elements
const submitButtonElement = document.getElementById("submit");
const usernameElement = document.getElementById("username");
const statusElement = document.getElementById("status");
const nameElement = document.getElementById("name");
const blogElement = document.getElementById("blog");
const locationElement = document.getElementById("location");
const favoriteLanguageElement = document.getElementById("favorite-language");
const bioElement = document.getElementById("bio");
const avatarElement = document.getElementById("avatar");

// add event listener for submit button
submitButtonElement.addEventListener("click", submitButtonListener);

// handle flow of program after submit button, pushed
function submitButtonListener() {
    // make status empty
    updateStatus("", "white");

    // handle empty username
    if (!(username = usernameElement.value)) {
        updateStatus("type a username please", "red");
        return;
    }

    // get user data from storage or api
    const userData = (localStorageData = getLocalStorageData(username)) ? 
        localStorageData : getUserProfileData(username);

    // if data found in storage or found in server
    if (userData) {
        // save data on local storage if not in
        if (!localStorageData) {
            saveToLocalStorage(username, userData);
        } else {
            updateStatus("data retrieved from local storage", "green");
        }

        // set data to screen
        setUserDataOnScreen(userData);
        return;
    }

    // if data not found in storage and server error occured too
    updateStatus("user not found", "red");
}

// get user data 
function getUserProfileData(username) {
    const api = getUsersApi(username);
    const xmlHttpRequest = new XMLHttpRequest();

    try {
        // get request (synchrone)
        xmlHttpRequest.open("GET", api, false);
        xmlHttpRequest.send(null);

        // parse json data
        const jsonParsedResponse = JSON.parse(xmlHttpRequest.responseText);

        // extract required data from response
        return jsonParsedResponse.id ? {
            name: jsonParsedResponse.name,
            blog: jsonParsedResponse.blog,
            location: jsonParsedResponse.location,
            favoriteLanguage: getFavoriteLanguage(username),
            bio: jsonParsedResponse.bio,
            avatar: jsonParsedResponse.avatar_url,
        }: null;
    } catch (error) {
        updateStatus("no response from server", "red");
        return null;
    }
}

// get favorite language by finding most used language in last five repos
function getFavoriteLanguage(username) {
    const api = getUsersReposApi(username);
    const xmlHttpRequest = new XMLHttpRequest();

    try {
        // get request (synchrone)
        xmlHttpRequest.open("GET", api, false);
        xmlHttpRequest.send(null);

        // parse json data
        const repos = JSON.parse(xmlHttpRequest.responseText);

        // array is sorted by pushed when we requested by (sort=pushed) parameter
        // get languages of last 5 pushed repos
        const languages = repos.slice(0, 5).map(repo => repo.language);
        
        return (Object.keys(languages).length > 0) ? getMostFrequent(languages) : "";
    } catch (error) {
        updateStatus("no response from server", "red");
        return "";
    }
}

// set data of screen by founded data from storage or api (for empty data we put a default value)
function setUserDataOnScreen(userData) {
    nameElement.innerText = userData.name || "name not found";
    blogElement.innerText = userData.blog || "blog not found";
    locationElement.innerText = userData.location || "location not found";
    favoriteLanguageElement.innerText = userData.favoriteLanguage || "favorite language not found";
    bioElement.innerText = userData.bio || "bio not found";
    avatarElement.src = userData.avatar;
}

// save array data to storage by stringify it
function saveToLocalStorage(username, userData) {
    localStorage.setItem(username, JSON.stringify(userData));
}

// get data from storage and convert it to array
function getLocalStorageData(username) {
    if (localStorageData = localStorage.getItem(username)) {
        return JSON.parse(localStorageData);
    }
    return null;
}

// api for getting user profile data
function getUsersApi(username) {
    return `https://api.github.com/users/${username}`;
}

// api for getting user repos with sorting by pushed
function getUsersReposApi(username) {
    return `https://api.github.com/users/${username}/repos?sort=pushed`;
}

// update status of status text
function updateStatus(text, color) {
    statusElement.innerText = text;
    statusElement.style.color = color;
}

function getMostFrequent(arr) {
    const hashmap = arr.reduce( (acc, val) => {
     acc[val] = (acc[val] || 0 ) + 1
     return acc
    },{});
    delete hashmap["null"];

    return (Object.keys(hashmap).length > 0) ? Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b) : "";
}