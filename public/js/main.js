window.onload = (function () {
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
        
        nick = data.nick;
        console.log(data);
        isPlayer = data.isPlayer;
        
        console.log('Constructing robots!');
        console.log(data.robots);
        gGame.robots = (function () {
            var a = [],
                robotData = null;
            for (var key in data.robots) {
                if (typeof data.robots[key] === 'object') {
                	robotData = data.robots[key];
                    a.push(
                        new RobotClass(
                            robotData.id,
                            robotData.life,
                            robotData.att,
                            robotData.def,
                            robotData.lowerDef,
                            robotData.upperDef,
                            robotData.delay
                        )
                    );
                }
            }
            return a;
        }());
        
        if (gGame.robots.length === 2) {
        	gGame.robots[0].rivalId = gGame.robots[1].id;
        	gGame.robots[1].rivalId = gGame.robots[0].id;
        }
        console.log(gGame.robots);
        
        if (isPlayer) {
            console.log('Building robot controller!');
            gGame.player.robotController = new RobotControllerClass(terminalInput.id, data.userId);
            socket.on('commandSuccessfullyBroadcast', gGame.player.robotController._transmitCommandToRobot);
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
                        gGame.player.robotController.broadcastCommand(cmd);
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
    /**
     * Happens if a player's connection was previously broken
     *  And reconnects
     */
    socket.on('playerReconnected', function(robotId) {
        console.log('<playerReconnected>');
        console.log(robotId);
        console.log('</playerReconnected>');
        
    });
    
    socket.on('preparingToUnload', function () {
        console.log('<preparingToUnload />');
        socket.emit('leave', {isPlayer: isPlayer, userId: userId});
    });
    socket.on('userLeft', function (robotId) {
        console.log('<userLeft>');
        console.log(robotId);
        console.log('</userLeft>');
        if (robotId !== false) {
	        var index;
	        gGame.robots.map(function (robot, key) {
	        	if (robot.id == robotId) {
	        		index = key;
	        	}
	        });
	        if (index !== undefined) {
	        	gGame.robots.splice(index, 1);
	        } else {
	        	throw new Error('Could not find any robot with given id: "' +  robotId + '"');
	        }
        }
    });
    socket.on('getNewMessage', function (data) {
        console.log('<getNewMessage>');
        console.log(data);
        console.log('</getNewMessage>');
        
        outputToChat(data);
    });
    /**
     * Happens after first connection, when a new player joins the game
     * data.id,
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
        
        if (gGame.robots[0]) {
        	gGame.robots[0].rivalId = data.id;
        }
        gGame.robots.push(
            new RobotClass(
                data.id,
                data.life,
                data.att,
                data.def,
                data.lowerDef,
                data.upperDef,
                data.delay
            )
        );
        
        gGame.robots[1].rivalId = gGame.robots[0].id;
        
        gGame.robots.sort(function (a, b) {
        	return (a.playerRobotId < b.playerRobotId) ? -1 : 1;
        });
    });
    /**
     * Happens when a new spectator joins the game
     * 
     */
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
        var index;
        for (var i = 0, l = gGame.robots.length; i < l; i++) {
        	if (gGame.robots[i].id === data.robotId) {
        		gGame.robots[i].exec(data.command);
        		break;
        	}
        }
     });
     
     socket.on('winner', function (robotId) {
     	console.log('<winner>');
        console.log(robotId);
        console.log('</winner>');
     });
}());