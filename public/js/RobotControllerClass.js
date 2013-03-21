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
        gGame.player.robotController.isLocked = true;
        gGame.player.robotController.input.setAttribute('readonly', 'readonly');
    },
    unlockInput: function () {
        gGame.player.robotController.isLocked = false;
        gGame.player.robotController.input.removeAttribute('readonly');
    },
    init: function (inputId, robotId) {
        gGame.player.robotController.input = document.getElementById(inputId);
        if (Object.prototype.toString.call(gGame.player.robotController.input)
        !== '[object HTMLTextAreaElement]') {
            throw new Error('Input element not found with id: "' + inputId + '"');
        }
        gGame.player.robotController.robotId = robotId;
    },
    broadcastCommand: function (cmd) {
        console.log('Emit <commandSent>');
        gSocket.emit('commandSent', {
            playerId: gSocket.userId,
            command: cmd,
            robotId: gGame.player.robotController.robotId
        });
    },
    _transmitCommandToRobot: function (cmd) {
        if (gGame.player.robotController.robotId !== null) {
            (gGame.robots[gGame.player.robotController.robotId]).exec(cmd);
        }
    }
});