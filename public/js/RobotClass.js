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
    attack: function (rivalId, zone) {
    	console.log('rivalId: "' + rivalId + '" zone: "' + zone + '"');
    	switch (zone) {
		case 'lower':
			break;
		case 'upper':
			break;
		default:
			break;
    	}
    },
    defend: function (zone) {
    	console.log('zone: "' + zone + '"');
    	switch (zone) {
		case 'lower':
			break;
		case 'upper':
			break;
		default:
			break;
    	}
    },
    /**
     * Executes a given command
     * @throws Error if command is not available
     */
    exec: function (cmd) {
        console.log('exec("' + cmd + '")');
        ((RobotClass.availableCommands())[cmd]
        || (function () { throw new Error('Invalid command'); }()))
            .apply(this, [this.id, this.rivalId]);
    },
    setRivalId: function (rivalId) {
        this.rivalId = rivalId;
    }
});

RobotClass.availableCommands = function () {
	var robot;
    return {
        'att upper': function (selfId, rivalId) {
            robot = RobotClass.find(selfId);
            if (robot) {
            	robot.attack(rivalId, 'upper');
            }
        },
        'att lower': function (selfId, rivalId) {
            robot = RobotClass.find(selfId);
            if (robot) {
            	robot.attack(rivalId, 'lower');
            }
        },
        'def upper': function (selfId) {
            robot = RobotClass.find(selfId);
            if (robot) {
            	robot.defend('upper');
            }
        },
        'def lower': function (selfId) {
            robot = RobotClass.find(selfId);
            if (robot) {
            	robot.defend('lower');
            }
        }
    };
}
RobotClass.find = function (id) {
	var index;
	gGame.robots.map(function(robot, key) {
		if (robot.id === id) {
			index = key;
		}
	});
	if (index !== undefined) {
		return gGame.robots[index];
	}
};
