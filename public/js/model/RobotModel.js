var RobotModel = ArrayListModel.extend({
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
    	var rival = RobotModel.find(rivalId),
    		damage;
    	switch (zone) {
		case 'lower':
			damage = this.att - rival.lowerDef;
			break;
		case 'upper':
			damage = this.att - rival.upperDef;
			break;
		default:
			break;
    	}
    	rival.life -= (damage >= 0) ? damage : 0;
    	if (rival.life <= 0) {
    		gSocket.emit('winner', this.id);
    	}
    	return damage;
    },
    defend: function (zone) {
    	console.log('zone: "' + zone + '"');
    	var defBonus = 2;
    	switch (zone) {
		case 'lower':
			this.lowerDef += defBonus;
			break;
		case 'upper':
			this.upperDef += defBonus;
			break;
		default:
			break;
    	}
    	return defBonus;
    },
    /**
     * Executes a given command
     * @throws Error if command is not available
     */
    exec: function (cmd) {
        console.log('exec("' + cmd + '")');
        var fn = ((RobotModel.availableCommands())[cmd] || (function () { throw new Error('Invalid command'); }()))
        console.log(fn(this.id, this.rivalId));
    },
    setRivalId: function (rivalId) {
        this.rivalId = rivalId;
    }
});

RobotModel.availableCommands = function () {
	var robot;
    return {
        'att upper': function (selfId, rivalId) {
            robot = RobotModel.find(selfId);
            if (robot) {
            	return robot.attack(rivalId, 'upper');
            }
        },
        'att lower': function (selfId, rivalId) {
            robot = RobotModel.find(selfId);
            if (robot) {
            	return robot.attack(rivalId, 'lower');
            }
        },
        'def upper': function (selfId) {
            robot = RobotModel.find(selfId);
            if (robot) {
            	return robot.defend('upper');
            }
        },
        'def lower': function (selfId) {
            robot = RobotModel.find(selfId);
            if (robot) {
            	return robot.defend('lower');
            }
        }
    };
}

RobotModel.find = function (id) {
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