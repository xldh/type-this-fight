/**
 * @class RobotControllerClass
 * @property {HTMLTextAreaElement} input
 * @property {Number} robotId
 * @property {Boolean} isLocked
 */
var RobotControllerClass = Class.extend({
    input: null,
    robotId: null,
    isLocked: false,
    lockInput: function () {
        this.isLocked = true;
        this.setAttribute('readonly', 'readonly');
    },
    unlockInput: function () {
        this.player.robotController.isLocked = false;
        this.removeAttribute('readonly');
    },
    init: function (inputId, robotId) {
        this.input = document.getElementById(inputId);
        if (Object.prototype.toString.call(this.input)
        !== '[object HTMLTextAreaElement]') {
            throw new Error('Input element not found with id: "' + inputId + '"');
        }
        this.robotId = robotId;
    },
    broadcastCommand: function (cmd) {
        console.log('Emit <commandSent>');
        gSocket.emit('commandSent', {
            playerId: gSocket.userId,
            command: cmd,
            robotId: this.robotId
        });
    },
    _transmitCommandToRobot: function (cmd) {
		var robot;
        if (this.robotId !== null) {
        	robot = RobotClass.find(gGame.player.robotController.robotId);
            if (robot) {
	            robot.exec(cmd);
            } else {
            	throw new Error('Could not transmit command to robot, because no robot was found for id: "'+ this.robotId +'"');
            }
        }
    }
});