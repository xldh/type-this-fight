(function () {
    "use strict";
    window.gSocket = io.connect('', { 'sync disconnect on unload': true });
    window.gGame = {
        askForRobotController: true,
        robots: [],
        player: {
            robotController: {},
        }
    };
    /*********************************************
     * ALL IN-CONTEXT VARS SHOULD BE DEFINED HERE
     *
     * 
     *********************************************/
    var socket = window.gSocket,
        robots = window.gGame.robots,
        player = window.gGame.player,
        canvasBox = new CanvasBoxClass('TheCanvasWhoSaysNi'),
        DOMHandler = new DOMHandlerClass(),
        chatInput = document.getElementById('chat-input'),
        terminalInput = document.getElementById('terminal-input'),
        chatOutput = document.getElementById('chat'),
        terminalOutput = document.getElementById('terminal'),
        nick,
        isPlayer,
        userId;
//
    // HELPER FUNCTIONS
    function outputToChat(data) {
//      console.log(data.nick + " said " + data.msg);
        chatOutput.innerText += "[" + data.nick + "] dit : " + data.msg + "\n";
    }
    function clearInput(input) {
        input.value = '';
    } 
//    
    /*****************************
     * DATA EMISSION/RECEPTION
     * SYNC WITH NODEJS SERVER
     * 
     * 
     *****************************/
 //
     /**
      * data.nick
      * 
      *** ROBOT DATA **************
      * @var {Number} data.userId
      * @var {Number} data.life
      * @var {Number} data.att
      * @var {Number} data.def
      * @var {Number} data.lowerDef
      * @var {Number} data.upperDef
      * @var {Number} data.delay
      */
    socket.on('connected', function (data) {
        console.log('<connected>');
        console.log(data);
        console.log('</connected>');
        
        nick = "user#" + data.userId;
        userId = data.userId;
        isPlayer = data.isPlayer;
        
        console.log('Constructing robots!');
        gGame.robots = (function () {
            var a = [],
                robot = null;
            for (var key in gGame.robots) {
                if (gGame.robots.hasOwnProperty(key)) {
                    a.push(
                        new RobotClass(
                            robot.id,
                            robot.life,
                            robot.att,
                            robot.def,
                            robot.lowerDef,
                            robot.upperDef,
                            robot.delay
                        )
                    );
                }
            }
            return a;
        }());
        
        if (isPlayer) {
            console.log('Building robot controller!');
            player.robotController = new RobotControllerClass(
                terminalInput.id,
                data.userId
            );
            socket.on('commandSuccessfullyBroadcast',
                      player.robotController._transmitCommandToRobot);
        } else {
            console.log(
                'No more robot controllers available, you can watch though!'
            );
        }
        console.log('Parsing messages!');
        (Array.prototype.slice.call(data.messages)).map(function (data) {
            outputToChat(data);
        });
        console.log('Updating GUI!');
//
        /**
         * UNLOCKING GUI AT LAST
         */
         
         /******************************
         * DOM EVENTS
         * 
         *
         ******************************/
         DOMHandler.bind(chatInput, 'keyup', function (e) {
            var data = {};
            if (e.keyCode === 13) {
                data.msg = (chatInput.value.trim()).replace(/\n/g, '');
                data.nick = nick;
                if (data.msg.trim() !== "") {
                    socket.emit('newMessage', data);
                    outputToChat({'msg': data.msg, 'nick': 'Moi'});
                }
                clearInput(chatInput);
                return false;
            }
        });
        if (isPlayer) {
            DOMHandler.bind(terminalInput, 'keyup', function (e) {
                var cmd;
                if (e.keyCode === 13) {
                    cmd = (terminalInput.value.trim()).replace(/\n/g, '');
                    if (cmd !== '') {
                        player.robotController.broadcastCommand(cmd);
                    }
                    clearInput(terminalInput);
                    return false;
                }
            });
        }
        
        chatInput.removeAttribute('readonly');
        chatInput.placeholder = "Type in to chat...";
        terminalInput.removeAttribute('readonly');
        terminalInput.placeholder = "Type in to fight...";
    });
    socket.on('playerReconnected', function(robotId) {
        console.log('<playerReconnected>');
        console.log(robotId);
        console.log('</playerReconnected>');
        
    });
    
    socket.on('preparingToUnload', function () {
        console.log('<preparingToUnload />');
        socket.emit('leave', {isPlayer: isPlayer, userId: userId});
    });
    socket.on('userLeft', function (data) {
        console.log('<userLeft>');
        console.log(data);
        console.log('</userLeft>');
        
    });
    socket.on('getNewMessage', function (data) {
        console.log('<getNewMessage>');
        console.log(data);
        console.log('</getNewMessage>');
        
        outputToChat(data);
    });
    /**
     * data.playerRobotId,
     * data.life,
     * data.att,
     * data.def,
     * data.lowerDef,
     * data.upperDef,
     * data.delay
     */
    socket.on('getNewPlayerJoined', function (data) {
        console.log('<newPlayerJoined>');
        console.log(data);
        console.log('</newPlayerJoined>');
        
        gGame.robots.push(
            new RobotClass(
                data.playerRobotId,
                data.life,
                data.att,
                data.def,
                data.lowerDef,
                data.upperDef,
                data.delay
            )
        );
    });
    socket.on('getNewSpectatorJoined', function (nick) {
        outputToChat({nick: '[INFO]', msg: nick + ' a rejoint le chat en tant que spectateur'});
    });
    /**
     * data.playerId
     * data.robotId
     * data.command
     */
     socket.on('getCommandSent', function (data) {
        console.log('<getCommandSent>');
        console.log(data);
        console.log('</getCommandSent>');
        
        (gGame.robots[data.robotId]).exec(data.command);
     }); 
    // NO OTHER CHOICE BUT TO LEAVE THAT PIECE OF CODE HERE
    document.body.onbeforeunload = function () {
        if (socket) {
            socket.emit('preparingToUnload');
        }
    };
}());