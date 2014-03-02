var SourceCon   = require("./sourcecon"),
    events      = require("events"),
    moment      = require("moment");

var RCon = function(host, port, password, debug) {
    this.host       = host;
    this.port       = port;
    this.password   = password;
    this.debug      = debug;

    this.connection       = new SourceCon(this.host, this.port);
    this.connection.debug = this.debug;

    this.status        = false;
    this.console       = [];
    this.chat          = [];
    this.online        = [];
    this.currentOnline = 0;
    this.maxOnline     = 0;
    this.hostname      = '';

    this.items         = [
        'Wood Barricade',
        'Wood Shelter',
        'Low Grade Fuel',
        'Workbench',
        'Stone Hatchet',
        'Furnace',
        'Torch',
        'Low Quality Metal',
        'Metal Door',
        'Large Wood Storage',
        'Small Stash',
        'Gunpowder',
        'Sulfur',
        'Wood Planks',
        'Paper',
        'Explosives',
        'Bandage',
        'Large Medkit',
        'Small Medkit',
        '9mm Ammo',
        'Arrow',
        'Handmade Shell',
        'Shotgun Shells',
        '556 Ammo',
        '9mm Pistol',
        'Hatchet',
        'Hunting Bow',
        'Hand Cannon',
        'Pipe Shotgun',
        'P250',
        'Shotgun',
        'Pick Axe',
        'Explosive Charge',
        'F1 Grenade',
        'M4',
        'MP5A4',
        'Cloth Helmet',
        'Cloth Vest',
        'Cloth Pants',
        'Cloth Boots',
        'Leather Helmet',
        'Leather Vest',
        'Leather Pants',
        'Leather Boots',
        'Rad Suit Helmet',
        'Rad Suit Vest',
        'Rad Suit Pants',
        'Rad Suit Boots',
        'Kevlar Helmet',
        'Kevlar Vest',
        'Kevlar Pants',
        'Kevlar Boots',
        'Invisible Helmet',
        'Invisible Vest',
        'Invisible Pants',
        'Invisible Boots',
        'Flare',
        'Holo Sight',
        'Silencer',
        'Flashlight Mod',
        'Laser Sight',
        'Wood',
        'Wood Pillar',
        'Wood Foundation',
        'Wood Wall',
        'Wood Doorway',
        'Wood Window',
        'Wood Stairs',
        'Wood Ramp',
        'Wood Ceiling',
        'Metal Pillar',
        'Metal Foundation',
        'Metal Fragments',
        'Metal Wall',
        'Metal Doorway',
        'Metal Window',
        'Metal Stairs',
        'Metal Ramp',
        'Metal Ceiling',
        'Metal Window Bars',
        'Research Kit 1',
        'Uber Hatchet',
        'Uber Hunting Bow',
        'Cooked Chicken Breast',
        'Anti-Radiation Pills'
    ];

    this.hostnamePattern = /hostname:\s(.*)\n/;
    this.onlinePattern   = /\nplayers\s:\s([0-9]+)\s\(([0-9]+)\smax\)\n/;
    this.playerPattern   = /([0-9]+)\s\"(.*)\"\s+([0-9]+)\s+([0-9]+)s\s+([0-9.]+)/;
    this.chatPattern     = /\[CHAT\]\s\"(.*)\":\"(.*)\"/

    if(false === (this instanceof RCon)) {
        return new RCon;
    }
}

RCon.prototype = Object.create(events.EventEmitter.prototype);

RCon.prototype.connect = function (callback) {
    var rcon = this;

    console.log('RCON: connection to [' + rcon.host + ':' + rcon.port + ']');
    rcon.connection.on("message", function(message) {
        if (message.type === 4 && message.body.toString().indexOf('hostname:') === -1) {
            console.log('RCON: pushed new console message');

            var consoleMessage = {
                time: moment().format("MM-DD-YYYY HH:mm"),
                log: message.body.toString()
            };

            rcon.console.push(consoleMessage);
            rcon.emit("updateConsole", consoleMessage);
        }

        if (message.type === 4 && message.body.toString().indexOf('[CHAT]') != -1) {
            var chatMessageClean = message.body.toString();
            console.log('RCON: new chat message ' + chatMessageClean);

            rcon.chatMessage(chatMessageClean);
        } else if(message.type === 2 && message.id === -1) {
            rcon.emit("connectionProblem");
        } else if(message.type === 4 && (message.body.toString().indexOf('User Connected') != -1 || message.body.toString().indexOf('User Disconnected') != -1)) {
            console.log('User connect/disconnect, updating online list');
            rcon.send('status');
        } else if(message.type === 4 && message.body.toString().indexOf('Gave') == 0) {
            console.log("RCON: given to inventory something");
            rcon.emit("updateInventory", message.body.toString());
        } else if(message.type === 0 && message.body.toString().indexOf('hostname:') != -1) {
            var messageString = message.body.toString();

            var onlineMatch   = rcon.onlinePattern.exec(messageString);
            var hostnameMatch = rcon.hostnamePattern.exec(messageString);

            rcon.currentOnline = onlineMatch[1];
            rcon.maxOnline     = onlineMatch[2];
            rcon.hostname      = hostnameMatch[1];
            rcon.online        = [];

            messageString = messageString.split("\n");

            for (var i=0; i<messageString.length;i++) {
                var player = rcon.playerPattern.exec(messageString[i]);
                if (player) {
                    rcon.online.push({
                        steamid: player[1],
                        name: player[2],
                        ping: player[3],
                        played: moment.duration({seconds: player[4]}).humanize(),
                        ip: player[5]
                    });
                }
            }

            rcon.status = true;
            console.log("RCON: got new online " + rcon.online.length + " people");
            rcon.emit("updateOnline", rcon.online);
        }
    });

    rcon.connection.connect(function(err) {
        if (err) throw(err);
        console.log('RCON: connected to RCON server');
        rcon.connection.auth(rcon.password, function(err) {
            if (err) throw(err);
            console.log('RCON: authentification success');
            rcon.send('chat.serverlog true');
            rcon.send('status');
        });
    });
}

RCon.prototype.chatMessage = function(message) {
    var rcon = this;
    var matches = rcon.chatPattern.exec(message);

    if (matches) {
        var chatMessage = {
            name: matches[1],
            message: matches[2],
            time: moment().format("MM-DD-YYYY HH:mm"),
        };

        rcon.chat.push(chatMessage);
        rcon.emit("updateChat", chatMessage);
    }
}

RCon.prototype.topos = function(player, x, y, z, callback) {
    this.send('teleport.topos "' + player + '" "' + x + '" "' + y + '" "' + z + '"', callback);
}

RCon.prototype.toplayer = function(player1, player2, callback) {
    this.send('teleport.toplayer "' + player1 + '" "' + player2 + '"', callback);
}

RCon.prototype.kick = function(player, callback) {
    var rcon = this;
    rcon.send('kick "' + player + '"', function() {
        rcon.send('status', callback);
    });
}

RCon.prototype.banid = function(steamid, reason, callback) {
    this.send('banid "' + steamid + '" "' + reason + '"', callback);
}

RCon.prototype.ban = function(player, reason, callback) {
    var rcon = this;

    rcon.send('ban "' + player + '" "' + reason + '"', function() {
        rcon.kick(player, callback);
    });
}

RCon.prototype.give = function(player, item, count, callback) {
    this.send('inv.giveplayer "' + player + '" "' + item + '" "' + count + '"', callback);
}

RCon.prototype.giveall = function(item, count, callback) {
    this.send('inv.giveall "' + item + '" "' + count + '"', callback);
}

RCon.prototype.disconnect = function() {
    this.connection.disconnect();
    this.chat = [];
    this.online = [];
    this.hostname = '';
    this.currentOnline = 0;
    this.maxOnline = 0;
    this.status = false;
}

RCon.prototype.send = function(command, callback) {
    console.log("RCON: send [" + command + "]");

    this.connection.send(command, function(err, result) {
        if (err) throw(err);

        if (typeof callback != 'undefined') callback(result);
    });
}

module.exports = RCon;