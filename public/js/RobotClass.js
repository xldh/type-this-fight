/**
 * @class RobotClass
 * @property {Number} id
 * @property life
 * @property att
 * @property def
 * @property lowerDef
 * @property upperDef
 * @property delay
 */
var RobotClass = Class.extend({
    rivalId: null,
    /**
     * @constructor
     */
    init: function (robotId, life, att, def, lowerDef, upperDef, delay) {
        this.id = robotId;
        this.life = life;
        this.att = att;
        this.def = def;
        this.lowerDef = lowerDef;
        this.upperDef = upperDef;
        this.delay = delay;
    },
    /**
     * Executes a given command
     * @throws Error if command is not available
     */
    exec: function (cmd) {
        console.log('exec("' + cmd + "')");
        ((RobotClass.availableCommands())[cmd] 
        || (function () { throw new Error('Invalid command'); }()))
            .apply(this, [this.id, this.rivalId]);
    },
    setRivalId: function (rivalId) {
        this.rivalId = rivalId;
    }
});

RobotClass.availableCommands = function () {
    return {
        'att upper': function (attackerId, defenderId) {
            (gGame.robots[attackerId]).attack(defenderId, 'upper');
        },
        'att lower': function (attackerId, defenderId) {
            (gGame.robots[attackerId]).attack(defenderId, 'lower');
        },
        'def upper': function (attackerId, defenderId) {
            (gGame.robots[defenderId]).increaseDef('upper');
        },
        'def lower': function (attackerId, defenderId) {
            (gGame.robots[defenderId]).increaseDef('lower');
        }
    };
}