/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}
console.log("MUSIC.js")
// i no longer have any idea how any of this code works and ive only just written it...
var clientId=null;
function setup(){
    // var socket = io()
    clientId = Math.random().toString(36);
    socket = io.connect('http://192.168.0.50:80?id=' + clientId);

    console.log("SETUP")

    socket.on("update",
    function(data) {
        console.log("DATA GOT...")
        console.log(data)

        document.getElementById("currentTime").innerHTML=data.time
        document.getElementById("currentSongNum").innerHTML=data.songNum

        a=document.getElementById("resultsTable")
        a.remove()
        //create new table
        var row=document.createElement("tr")
        var rank=document.createElement("th")
        rank.innerHTML="Players"
        row.appendChild(rank)

        tab=document.createElement("table")              
        tab.id="resultsTable"
        tab.style="width:100%"
        tab.appendChild(row)
        tabdiv=document.getElementById("tableDiv")
        tabdiv.appendChild(tab)
        // fill it with data
        for (let i = 0; i < data.players.length; i++) {
            var row = document.createElement("tr");

            var name = document.createElement("td");

            row.appendChild(name)

            name.innerHTML = data.players[i]; 

            document.getElementById("resultsTable").appendChild(row)
        }
    }
    );
    socket.on("startGame", 
    function(data){
        // document.getElementById('songNum').hide()
        // document.getElementById('songNumButton').hide()
        console.log(data["players"])
        for (i of data["players"]){
            console.log("BUTTON MADE",i)
            var button = document.createElement("button")
            button.innerHTML=i
            button.onclick = function(){socket.emit("choice", this.innerHTML)}
            document.body.appendChild(button);
        }
    }
    );
    socket.on("time", 
    function(data){
        document.getElementById("timer").innerHTML=data
        console.log("TIME GOT ",data)
    }
    );
    socket.on("popup", 
    function(data){
        alert(data);
    }
    );

}

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

var oauthSource = document.getElementById('oauth-template').innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById('oauth');

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;
if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
    // render oauth info
    oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
    });
    
    } else {
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }
}

window.onload=function(){
    //getUserInfo()
}
function updateLogin(){
    document.getElementById('loginRedirect').href='/login?name='+document.getElementById("username").value+"&id="+clientId
}

function sendSettings(){
    // $.ajax({
    //     url: '/startGame',
    //     data: {"time":"long_term",
    //             "itemNum":"5", 
    // }})

    data={"time":document.getElementById("time").value,"itemNum":document.getElementById("songNum").value}
    console.log(data)
    socket.emit("update",data)
}

function startGame(){
    socket.emit("startGame")
    console.log(Spotify)
    const token = access_token;
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    document.getElementById('togglePlay').onclick = function() {
        console.log("TOGGLED PLAY")
        player.togglePlay();
    };
    console.log("player.connect")
    player.connect();
}
