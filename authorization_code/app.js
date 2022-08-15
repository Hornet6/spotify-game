/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { Socket } = require('dgram');
const app = express();
const fs = require('fs');

///////////////////////////////
////////Local ip stuff/////////
///////////////////////////////
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
for (const name of Object.keys(nets)) {
  //console.log(name)
  for (const net of nets[name]) {
    // console.log(net)
    if (name=="WiFi" && net.family=='IPv4'){
      console.log("IP ADDRESS IS:")
      console.log("http://"+net.address)
    }
  }
}
///////////////////////////////
////////Local ip stuff/////////
///////////////////////////////

//socket stuff
var server = app.listen(process.env.PORT || 80, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("LISTENING");
}

app.use(express.static("public"));

var socket = require("socket.io");
const { resourceUsage, emit } = require('process');
const { consumers } = require('stream');
const e = require('express');
var io = socket(server);

currentSettings={time:"long_term",
"songNum":25,
"players":[]
}
const idToConnectionHash = {};
const idToNameHash = {}
io.sockets.on('connection',
  function (socket) {
  console.log("We have a new client: " + socket.id);
  socket.emit("update",currentSettings)
  let id = socket.handshake.query.id;
  idToConnectionHash[id] = socket.id;
  // console.log(idToConnectionHash)
  // socket.emit("popup","connected")
  socket.on('startGame',
      async function() {
        console.log("NEW START HIT")
        var son = await startGame(currentSettings)
        console.log("SONG:")

        // son = son.sort(() => Math.random() - 0.5)
        console.log(son)
        // socket.emit("update",currentSettings)
        // save the data to a file

        var file = fs.createWriteStream('data.txt');
        file.on('error', function(err) { /* error handling */ });
        son.forEach(function(v) { file.write(v.join(', ') + '\n'); });
        file.end();
        console.log("WRITTEN")
        songIDs=[]
        for (j of son){
          songIDs.push(j[1])
        }
        ////////////////////////////////////
        //ENABLE TO AUTO CREATE A PLAYLIST//
        ////////////////////////////////////
        // pData={"name": "Spotify Game",
        // "description": "Tom's spotify game playlist",
        // "public": false,}

        // pSet={url:"https://api.spotify.com/v1/users/unkinderhornet6/playlists", 
        //   body: JSON.stringify(pData),  
        //   method: 'POST',
        //   headers: { 'Authorization': 'Bearer ' + tokens[0] }
        // }
        // request(pSet, function (error, response) {
        //   console.log(error,response.body);
        //   return;
        // });
        ////////////////////////////////////
        //ENABLE TO AUTO CREATE A PLAYLIST//
        ////////////////////////////////////
        pSet={url:"https://api.spotify.com/v1/playlists/7JfdLK0hfLizauodueHFwd/tracks", 
          body: JSON.stringify(songIDs),  
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + tokens[0] }
        }
        request(pSet, function (error, response) {
          console.log(error,response.body);
          return;
        });

        console.log("Game started")
        gamePlay()
      })
  
  socket.on('update',
  function(data) {
    console.log("update got")
    console.log(data)

    currentSettings["songNum"]=data["itemNum"]
    currentSettings["time"]=data["time"]
    console.log(currentSettings)
    io.emit("update",currentSettings)
  })
  socket.on('choice',
  function(data) {
    console.log('choice got:'+data)
  })
  socket.on('name',
  function(data) {
    //code
  })
  }
)
//end of socket stuff
var client_id = "dccd060f5bf04ace825b644338b71c88"; // Your client id
var client_secret = "947d82801bc847ea851575e7b12eb1b7"; // Your secret
// var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
// http://da64-77-98-51-123.eu.ngrok.io/callback
// var redirect_uri = 'http://localhost:80/callback';
var redirect_uri ='http://192.168.0.50:80/callback'
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var tokens=[];
var stateKey = 'spotify_auth_state';


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  let socketName = idToConnectionHash[req.query.id];

  if (typeof(req.query["name"]) != "undefined"){
    idToNameHash[socketName]=req.query["name"]
    currentSettings["players"].push(req.query["name"])
    // your application requests authorization
    var scope = 'user-read-private user-read-email user-top-read ';
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  }else{
      console.log("INVALID NAME")
      res.redirect('/')
      io.to(socketName).emit("popup","INVALID NAME")
  }
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  // console.log(req)

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        // console.log(body)
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        tokens.push(access_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        request.get(options, function(error, response, body) {
          console.log('REQUEST GOT:')
          // console.log(body);  
          // console.log("BODY")
          // console.log(body)
          // currentSettings["players"].push(body.display_name)
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});
async function apiCall(options){
  return new Promise ((resolve, reject) => {
    request.get(options, (err,res,bdy) => {
      if (err) return console.log('The API returned an error: ' + err);
      // console.log(bdy["items"])
      resolve(bdy);
    });
  })
}
async function startGame(settings){
  console.log("START GAME")
  // var type = settings.type
  var type="tracks"
  var itemNum = settings.songNum
  var time =settings.time
  console.log(settings)
  songs=[]
  // console.log("TOKENS")
  // console.log(tokens)
  // console.log(tokens.length)
  for(let i =0;i<tokens.length;i++){
    
    //https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=long_term
    var options = {
        // url: 'https://api.spotify.com/v1/me/top/'+type+'?limit='+itemNum+'&time_range='+time,
        url: 'https://api.spotify.com/v1/me/top/tracks?limit='+itemNum+'&time_range='+time,
        headers: { 'Authorization': 'Bearer ' + tokens[i] },
        json: true
      };
      h= apiCall(options)
      var dump = await h
      console.log("H:")
      console.log(h)
      console.log(settings.players[i])
      try{
        for (j of dump["items"]){
            songs.push([j.name,j.uri,settings.players[i]])
            // console.log(j.name)
        }
      }catch{
        console.log("ERORR ADDING FOR:",settings.players[i])
        console.log(dump)

      }
  }
  return songs
}
// app.get('/startGame', function(req, res) {
//       console.log("START GAME")
//       var type = req.query.type
//       var itemNum = req.query.itemNum
//       var time = req.query.time
//       console.log("TOKENS")
//       console.log(tokens.length)
//       for(let i =0;i<tokens.length;i++){
//         tokens[i]
//         var options = {
//             url: 'https://api.spotify.com/v1/me/top/'+type+'?limit='+itemNum+'&time_range='+time,
//             headers: { 'Authorization': 'Bearer ' + tokens[i] },
//             json: true
//           };
          
//           // use the access token to access the Spotify Web API
//           request.get(options, function(error, response, body) {
//             // console.log('REQUEST GOT:')
//             // console.log(body);  
//             topitems=[]
//             for (i of body["items"]){
//                 topitems.push(i.name)
//             }
//             console.log(topitems)
//           });
//       }
// })
// app.get('/refresh_token', function(req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });
///////////////////////////////
///handles the gameplay part///
///////////////////////////////
choices=[]
timePerSong=10

// socket.emit("startGame")

function checkChoice(){

}
function emitTime(x){
  io.emit("time",x)
}
function gamePlay(){
  io.emit("startGame",currentSettings)
  var c = timePerSong
  var timer = setInterval(function() {
    if (c<=0){
      console.log("time up")
      console.log("Selected were:")
      console.log(choices)
      clearInterval(timer);
      //CODE WHEN THE TIMER IS UP
      checkChoice()
      io.emit("popup","time up")
    }else{
      c=c-1
      // console.log("C TIME",c)
      emitTime(c)
    }
  },1000)

}
