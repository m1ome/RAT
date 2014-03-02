var fs = require('fs');

exports.status = function(req, res) {
    res.render('server', {
        layout: false,
        server: rconConnection
    });
}

exports.connect = function(req, res) {
    rconConnection.connect();
    res.send({error: ''});
}

exports.disconnect = function(req, res) {
    rconConnection.disconnect();
    res.send({error: ''});
}

exports.settings = function(req, res) {
    res.render('settings', {
        title: 'Settings',
        description: 'RustAdmin Settings',
        breadcrumbs: [['/settings', 'Settings']],
        settings: applicationConfig,
    });
}

exports.dashboard = function(req, res) {
    res.render('dashboard', {
        title: 'Dashboard',
        description: 'Server status and so on',
        breadcrumbs: false,
        server: rconConnection,
    });
}

exports.players = function(req, res) {
    res.render('players', {
        title: 'Players',
        description: 'Currently playing on server',
        breadcrumbs: [['/players', 'Players']],
        server: rconConnection,
    });
}

exports.chat = function(req, res) {
    var message = req.body.message;
    var popup   = req.body.popup;

    if (typeof message != 'undefined' && typeof popup != 'undefined') {
        var command = (popup == 1 ? 'notice.popupall "' + message + '"' : 'say "' + message + '"' );
        rconConnection.send(command);
        rconConnection.chatMessage('[CHAT] "SRV":"' + message + '"');
        res.send({ error: '' });
    } else {
        res.send({ error: 'message sending error' });
    }
}

exports.online = function(req, res) {
    res.render('online', {
        layout: false,
        server: rconConnection
    });
}

exports.kick = function(req, res) { 
    var player = req.body.player;

    rconConnection.kick(player, function() {
        res.send({error: ''});
    });
}

exports.ban = function(req, res) {
    var player = req.body.player;
    var reason  = req.body.reason;

    rconConnection.ban(player, reason, function(){
        res.send({errro: ''});
    });
}

exports.banid = function(req, res) {
    var steamid = req.body.steamid;
    var reason  = req.body.reason;

    rconConnection.banid(steamid, reason, function() {
        res.send({error: ''});
    });
}

exports.topos = function(req, res) {
    var player = req.body.player;
    var posx   = req.body.posx;
    var posy   = req.body.posy;
    var posz   = req.body.posz;

    rconConnection.topos(player, posx, posy, posz, function() {
        res.send({error: ''});
    });
}

exports.toplayer = function(req, res) {
    var player1 = req.body.player1;
    var player2 = req.body.player2;

    rconConnection.toplayer(player1, player2, function() {
        res.send({error: ''});
    });
}

exports.give = function(req, res) {
    var player   = req.body.player;
    var item     = req.body.item;
    var quantity = req.body.quantity;

    rconConnection.give(player, item, quantity, function() {
        res.send({error: ''});
    });
}

exports.giveall = function(req, res) {
    var item     = req.body.item;
    var quantity = req.body.quantity;

    rconConnection.giveall(item, quantity, function() {
        res.send({error: ''});
    });
}

exports.execute = function(req, res) {
    var command = req.body.command;

    rconConnection.send(command, function() {
        res.send({error: ''});
    });
}