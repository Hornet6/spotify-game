// var socket=io()
console.log("Hit")
function setup(){
    console.log("CONNECTED")
    socket = io.connect('http://192.168.0.50/');
    socket.on("popup", 
    function(data){
        alert(data);
    }
    );
    socket.on("forceRefresh", 
    function(){
        console.log("refreshing...")
        location.reload();
    }
    );
    socket.on("songName", 
    function(n){
        document.getElementById("song").innerHTML="Song name:"+n
        document.getElementById("buttons").hidden= false;
    }
    );
    // to allow the players to select their names from a list
    socket.on("playerSelect", 
    function(data){
        console.log("GOT",data)
        var names="Players: "
        for (i of data["got"]){
            names+=i+", "
            console.log(i)
        }
        document.getElementById("remainingPlayers").innerHTML=names
        // clear the old data in player names
        var node=document.getElementById("name")
        while (node.firstChild) {
            node.removeChild(node.lastChild);
          }
        // add the players names
        for (i of data["waiting"]){
            var option = document.createElement("option")
            option.innerHTML=i
            option.value=i
            node.appendChild(option)
        }
        var option = document.createElement("option")
        // DELETE THIS
        option.innerHTML="volvo"
        option.value="volvo"
        node.appendChild(option)
        // DELETE THIS
    })
    // to be implimented
    socket.on("startGame", 
    function(data){
        document.getElementById("setup").hidden = true;
        document.getElementById("buttons").hidden= false;
        var buttonDiv = document.getElementById("buttons")
        for (i of data){
            var button = document.createElement("button")
            button.innerHTML=i
            button.onclick = function(){socket.emit("choice", this.innerHTML); 
                document.getElementById("buttons").hidden= true; 
                document.getElementById("chosen").innerHTML="You chose:"+this.innerHTML
                document.getElementById("chosen").hidden=false
            }
            buttonDiv.appendChild(button);
        }
    }
    );
    socket.on("time", 
    function(data){
        document.getElementById("time").innerHTML="time:"+data
    }
    );
    socket.on("scores", 
    function(data){
        console.log("SCORES",data)
        var tr
        var td
        var node=document.getElementById("scoreTable")
        while (node.firstChild) {
            node.removeChild(node.lastChild);
          }
        for (i in data){
            tr=document.createElement("tr")
            td=document.createElement('td')
            td.innerHTML=i
            tr.appendChild(td)
            td=document.createElement('td')
            td.innerHTML=data[i]
            tr.appendChild(td)
            document.getElementById("scoreTable").appendChild(tr)
        }
    }
    );
}
