
/**
 * Module dependencies.
 */

var express = require('express');
    app = express(),
    fs = require('fs'),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    routes = require('./routes'),
    routing = require('./routes/routing'),
    domain = require('domain'),
    path = require('path'),
    partials = require('express-partials'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    RCon = require('./libs/rcon.js');

var data = fs.readFileSync('./config/config.json');

try {
    config = JSON.parse(data);
}catch (err) {
    console.log('There has been an error parsing your JSON.')
    console.log(err);
}

rconConnection = new RCon(config.host, config.port, config.pass);

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.favicon());  
    app.use(partials());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'liStijWoDoccequip', cookie: { maxAge: 31557600 }}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next) {
        var requestDomain = domain.create();
        requestDomain.add(req);
        requestDomain.add(res);
        requestDomain.on('error', function(error) {
            if (error.code == 'ECONNREFUSED') {
                rconConnection.emit("connectionProblem");
            }
        });
        requestDomain.run(next);
    });
    app.use(app.router);
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done) {
    if (username == config['auth']['username'] && password == config['auth']['pass']) {
        return done(null, username);
    } else {
        return done(null, false, {message: 'Incorrect username/password'});
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function IsAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login');
    }
}

app.get('/', IsAuthenticated, routing.dashboard);
app.get('/players', IsAuthenticated, routing.players);
app.get('/settings', IsAuthenticated,  routing.settings);
app.get('/login', function(req, res) {
    res.render('login', {
        layout: false,
    });
});

app.post('/login', passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login' }));

    app.get('/connect', IsAuthenticated, routing.connect);
app.get('/disconnect', IsAuthenticated, routing.disconnect);
app.get('/status', IsAuthenticated, routing.status);

app.post('/chat', IsAuthenticated, routing.chat);
app.post('/give', IsAuthenticated, routing.give);
app.post('/giveall', IsAuthenticated, routing.giveall);
app.post('/kick', IsAuthenticated, routing.kick);
app.post('/online', IsAuthenticated, routing.online);
app.post('/execute', IsAuthenticated, routing.execute);
app.post('/ban', IsAuthenticated, routing.ban);
app.post('/banid', IsAuthenticated, routing.banid);
app.post('/topos', IsAuthenticated, routing.topos);
app.post('/toplayer', IsAuthenticated, routing.toplayer);

io.sockets.on('connection', function (socket) {
    rconConnection.on("updateChat", function(message){
        socket.emit("updateChat", message);
    });

    rconConnection.on("updateOnline", function(online){
        socket.emit("updateOnline", online);
    });

    rconConnection.on("updateInventory", function(message) {
        socket.emit("updateInventory", message);
    });

    rconConnection.on("connectionProblem", function() {
        socket.emit("connectionProblem");
    });
});

server.listen(app.get('port'));
