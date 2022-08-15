const fs = require('fs');
const express = require('express');
const app = express();

// if the song names have a comma in them this might break

// a unique list of names(should really be a set)
names=[]
// a list of songs in the order they are going to be played
songs=[]
// a dict to convert from song names to whos top played song it is
// breaks if two songs have the same name but not likely
songsToNames={}
// converts from the song names to their unqiue spotify IDs
// again breaks if two songs have the same name
namesToIDs={}
// this part reads from the file and populates the structures above
// it is stored with each entry as a new line CSV (song name, track id, player name)
fs.readFile('../data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
//   console.log(data);
  var split = data.split("\n")
  var l
  for (i of split){
    if (i != ''){
        l=i.split(",")
        // get unique names
        if (!names.includes(l[2].slice(1))){
            names.push(l[2].slice(1))
        }
        songs.push(l[0])
        songsToNames[String(l[0])]=l[2].slice(1)
        namesToIDs[String(l[0])]=l[1]
    }
  }
  // printDets()
});
function printDets(){
  console.log(names)
  console.log(songs)
  console.log(songsToNames)
  console.log(namesToIDs)
  console.log(songsToNames["Chocolate"])
}
  
//////////////////////////////////
// USED TO FIND CURRENT IP ADDRESS
//////////////////////////////////
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
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

var server = app.listen(process.env.PORT || 80, listen);

function listen() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("LISTENING");
}
app.use(express.static("public"));

var socket = require("socket.io");
var io = socket(server);
// for a refresh for people that might have stayed on the page (DOESNT WORK)
io.emit("forceRefresh")


nameToId={}
idToName={}
unusedNames=names
gotNames=[]
scores={}

io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log("We have a new client: " + socket.id);
    io.emit("playerSelect",{"waiting":unusedNames,"got":gotNames})

  socket.on('disconnect', function() {
    console.log("Client has disconnected: " + socket.id );
  })
  socket.on('selectName', function(name) {
    if (unusedNames.includes(name)){
      nameToId[name]=socket.id
      idToName[socket.id]=name
      var newNames=[]
      for (i of unusedNames){
        if (!(i==name)){
          newNames.push(i)
        }
      }
      gotNames.push(name)
      if (newNames.length==0){
        // start game
        console.log("START GAME")
        startGame()
      }
      unusedNames=newNames
      io.emit("playerSelect",{"waiting":unusedNames,"got":gotNames})
    }else{
      console.log("====ERROR====")
      console.log("UNKNOWN NAME SELECTED",name)
      console.log(names)
      console.log(unusedNames)
      console.log("====ERROR====")
    }
  })
  socket.on('choice', function(name) {
    choices[socket.id]=name
  })
})

choices={}
timePerSong=10
timeBetweenRounds=5
// socket.emit("startGame")

function startGame(){
  io.emit("startGame",names)
  // wipe choices and scores clean
  choices={}

  for (i of names){
    scores[i]=0
  }
  round()
}
function round(){
  choices={}
  if (songs.length>1){
    var s = songs.pop()
    io.emit("songName",s)
    countdown(timePerSong,checkChoice,songsToNames[s])
  }else{
    console.log("END")
    io.emit("popup","Game Over")
    return
  }
}
function checkChoice(ans){
  console.log("choices",choices)
  for (i in choices){
      if (choices[i]==ans){
        scores[idToName[i]]+=1
      }
  }
  io.emit("scores",scores)
  countdown(timeBetweenRounds,round,"")
}

function countdown(time,callback,n){
  // io.emit("startGame",currentSettings)
  var c = time
  var timer = setInterval(function() {
    if (c<=0){
      clearInterval(timer);
      //CODE WHEN THE TIMER IS UP
      callback(n)
    }else{
      c=c-1
      io.emit("time",c)
    }
  },1000)
}