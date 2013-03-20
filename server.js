var http = require("http"),
    express = require("express"),
    io = require("socket.io"),
    fs = require("fs"),
    app = express(),
    server = null,
    nickPool = ['Robert', 'Joey', 'Tommy', 'NachoCheese'],
    config = JSON.parse(fs.readFileSync('config.json', 'utf-8')),
    node_env = config.NODE_ENV || 'dev',
//////////////////////////////
//  SERVER GLOBAL VARIABLES //
    messages = [],          //
    clients = {},            //
    robots = {length: 0},   //
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
    var connectionData = {},
        nick = nickPool[~~(Math.random() * (nickPool.length - 1))],
        robot;
    
    clients[socket.id] = socket;
    
    console.log('<connection>');
    console.log(socket.id);
    console.log('</connection>');
    console.log('');
    connectionData.nick = nick;
    connectionData.isPlayer = false;
    // searching a robot sharing socket's id
    if (robots.hasOwnProperty(socket.id)) {
        console.log('Found a robot corresponding to id: ' + socket.id);
        robot = robots[socket.id];
    }
    if (robot === undefined && robots.length < 2) { // We can assign the player a robotId so that he/she can play
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
         // robot sent to client must not store id
        socket.broadcast.emit('newPlayerJoined', connectionData);
        robots[socket.id] = robot;
        robots.length++;
        
    } else if (robot) {
        socket.broadcast.emit('playerReconnected', {robotId: robot.id});
    } else { // Spectator user
        socket.broadcast.emit('newSpectatorJoined', nick);
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
            //robots.e
        }
        socket.broadcast.emit('userLeft');
        socket.disconnect();
    });
    socket.on('disconnect', function () {
        delete clients[socket.id];
    });
    socket.on('newMessage', function (data) {
        messages.push(data);
        console.log('newMessage: "' + data.msg + '" from: "' + data.nick + '"');
        socket.broadcast.emit('getNewMessage', data);
    });
    connectionData.messages = messages;
    connectionData.robots = robots;
    connectionData.nick = nick;
    connectionData.userId = id;
    connectionData.isPlayer = connectionData.isPlayer;
    socket.emit('connected', connectionData);
});