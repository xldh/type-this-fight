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
        this.input.setAttribute('readonly', 'readonly');
    },
    unlockInput: function () {
        this.isLocked = false;
        this.input.removeAttribute('readonly');
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
        if (this.robotId !== null) {
            (gGame.robots[this.robotId]).exec(cmd);
        }
    }
});