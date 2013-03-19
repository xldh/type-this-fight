var http = require("http"),
    express = require("express"),
    io = require("socket.io"),
    fs = require("fs"),
    app = express(),
    server = null,
    config = JSON.parse(fs.readFileSync('config.json', 'utf-8')),
    node_env = config.NODE_ENV || 'dev',
//////////////////////////////
//  SERVER GLOBAL VARIABLES //
    messages = [],          //
    robots = {},            //
    id = -1;                //
//////////////////////////////
// configure express
app.get('/', function (req, res) {
    if (node_env === 'prod') {
        res.sendfile('public/index.html');
    } else if (node_env === 'dev') {
        res.sendfile('public/index.dev.html');
    } else {
        throw new Error ('Node environment should be prod or dev');
    }
});
app.use(express.static(__dirname + '/public'));
// configure http server
server = http.createServer(app);
// configure io
io = io.listen(server);
io.set('log level', 1);
io.configure('prod', function(){
  io.enable('browser client etag');
  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

io.configure('dev', function(){
  io.set('log level', 1);
  io.set('transports', ['websocket']);
});

// finish http server configuration
server.listen(process.env.PORT || 1337);
// configure socket events
io.sockets.on('connection', function (socket) {
    console.log('<connection>');
    console.log(socket.id);
    console.log('</connection>');
    var connectionData = {},
        robot;
    
    socket.userId = id;
    connectionData.isPlayer = false;
    // searching a robot sharing socket's sessionId
    if (robots.hasOwnProperty(socket.sessionId)) {
        robot = robots[socket.sessionId];
    }
    if (!robot && robots.length < 2) { // We can assign the player a robotId so that he/she can play
        id++;
        connectionData.isPlayer = true;
        connectionData.playerRobotId = id;
        
        robot = {
            id: id,
            life: 100,
            att: parseInt(1 + Math.random() * 9, 10),
            def: parseInt(Math.random() * 3, 10),
            upperDef: 0,
            lowerDef: 0,
            delay: 2.0
        };
         // robot sent to client must not store sessionId
        socket.broadcast.emit('newPlayerJoined', robot);
        
        robots[socket.sessionId] = robot;
    } else if (robot) {
        socket.broadcast.emit('playerReconnected', {robotId: robot.id});
    } else { // Spectator user
        socket.broadcast.emit('newSpectatorJoined', socket.userId);
    }
    
    /**
     * data.playerId
     * data.robotId
     * data.command
     */
    socket.on('commandSent', function (data) {
        console.log('<commandSent>');
        console.log(data);
        console.log('</commandSent>');
        
        socket.broadcast.emit('getCommandSent', data);
        socket.emit('commandSuccessfullyBroadcast', data.command);
    });
    
    /**
     * @var {Number|void} data.robotId
     */
    socket.on('leave', function (data) {
        console.log('<leave>');
        console.log(data);
        console.log('</leave>');
        if (data.robotId !== null) {
            robots.er
        }
        socket.broadcast.emit('userLeft');
        socket.disconnect();
    });
    socket.on('newMessage', function (data) {
        messages.push(data);
        console.log('newMessage: "' + data.msg + '" from: "' + data.nick + '"');
        socket.broadcast.emit('getNewMessage', data);
    });
    
    connectionData.messages = messages;
    connectionData.robots = robots;
    connectionData.nick = "user#" + socket.userId;
    connectionData.userId = socket.userId;
    connectionData.isPlayer = connectionData.isPlayer;
    socket.emit('connected', connectionData);
});