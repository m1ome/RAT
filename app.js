
/**
 * Module dependencies.
 */

var async = require('async'),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http'),
    mysql = require('mysql'),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    // routes = require('./routes'),
    routing = require('./routes/routing'),
    domain = require('domain'),
    path = require('path'),
    partials = require('express-partials'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    timeplan = require('timeplan'),
    RCon = require('./libs/rcon.js');


// Init models
var admin    = require('./models/Admin.js'),
    teleport = require('./models/Teleport.js');

async.waterfall([
    function(callback) {
        var data  = fs.readFileSync('./database.json');
        var error = false;

        try {
            applicationConfig = {};
            databaseConfig = JSON.parse(data);

            databaseConnection = mysql.createConnection({
                host     : databaseConfig.production.host,
                user     : databaseConfig.production.user,
                password : databaseConfig.production.password,
                database : databaseConfig.production.database
            });

            // Connecting to DB
            databaseConnection.connect(function(err) {
                if (err) {
                    error = 'Wrong Db connection params';
                    console.log(err);
                }
            });

            // Reading main config
            databaseConnection.query("SELECT * FROM `settings`", function(err, rows) {
                for(var i=0; i<rows.length; i++) {
                    applicationConfig[rows[i].name] = rows[i].value;
                }

                rconConnection = new RCon(
                    applicationConfig['rust.host'], 
                    applicationConfig['rust.port'], 
                    applicationConfig['rust.password'], 
                    (applicationConfig['config.debug'] == 'true') ? true : false
                );
            });
        }catch (err) {
            error = 'There has been an error parsing your database.json config file.';
            console.log(err);
        }

        callback(null, error);
    },
    function(error, callback) {
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
            app.use(function(req, res) {
                res.render('404', {
                    layout: false,
                });
            });
        });       

        // Passport bindings
        
        passport.use(new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password'
            }, function(username, password, done) {
                databaseConnection.query("SELECT `id`,`password`,`username` FROM `admins` WHERE `username`=?", [username]).on('result', function(row) {
                    if (row.password == password) {
                        return done(null, row.id);
                    } else {
                        return done(null, false, {message: 'Incorrect username/password'});
                    }
                }).on('error', function(err) {
                    return done(null, false, {message: 'Incorrect username/password'});
                });
        }));

        passport.serializeUser(function(id, done) {
            done(null, id);
        });

        passport.deserializeUser(function(id, done) {
            admin.findOne(id, function(_user) {
                done(null, _user);
            });
        });

        roleCheck = function(role) {
            var user = app.get('session:user');
            return (user && user.roles.indexOf(role) != -1 || user.roles.indexOf('root') != -1);
        }

        requireRole = function(role) {
            return function(req, res, next) {
                var user = app.get('session:user');
                if (user && user.roles.indexOf(role) != -1 || user.roles.indexOf('root') != -1) next();
                else res.send(403);
            }
        }

        app.all('*', function(req, res, next) {
            if (applicationConfig['config.nologin'] === 'true') {
                app.set('session:user', {id: 1, username: 'admin', roles: ['root']});
            } else {
                app.set('session:user', req.user);
            }
            var auth = req.isAuthenticated() || applicationConfig['config.nologin'] === 'true';

            if (auth || req.url == '/login') {
                next();
            } else {
                res.redirect('/login');
            }
        });

        app.get('/', routing.dashboard);
        app.get('/players', routing.players);
        app.get('/settings', requireRole('settings'), routing.settings);
        
        // Restful API for Admins
        app.get('/admins', requireRole('admins'), function(req, res) {
            admin.findAll(function(admins) {
                res.render('admins', {
                    title: 'Admins',
                    description: 'Manage admin of server',
                    breadcrumbs: [['/admins', 'Admins']],
                    admins: admins,
                    roles: admin.roles
                });
            });
        });
        app.post('/admins', requireRole('admins'), function(req, res) {
            var username = req.body.username;
            var password = req.body.password;
            var roles    = Object.keys(req.body.roles);

            admin.create(username, password, roles, function(result) {
                res.redirect('/admins');
            });
        });
        app.get('/admins/:id', requireRole('admins'), function(req, res) {
            admin.findOne(req.params.id, function(result) {
                res.render('admin_edit', {
                    title: 'Admins',
                    description: 'Edit admin',
                    breadcrumbs: [['/admins', 'Admins'], ['/admins/' + result.id, result.username]],
                    admin: result,
                    roles: admin.roles
                })
            });
        });
        app.put('/admins/:id', requireRole('admins'), function(req, res) {
            var username = req.body.username;
            var password = req.body.password;
            var roles    = Object.keys(req.body.roles);
            var id       = req.params.id;

            admin.update(id, username, password, roles, function() {
                res.redirect('/admins');
            });
        });
        app.delete('/admin/:id', requireRole('admins'), function(req, res) {
            admin.del(req.body.id, function(err, result) {
                if (err) res.send({error: err});
                else res.send({error: ''});
            });
        });

        // Restful API for Teleports
        app.get('/teleports', requireRole('teleports'), function(req, res) {
            teleport.findAll(function(teleports) {
                res.render('teleports', {
                    title: 'Teleports',
                    description: 'Manage teleport presets',
                    breadcrumbs: [['/teleports', 'Teleports']],
                    teleports: teleports
                });
            });
        });
        app.post('/teleports', requireRole('teleports'), function(req, res) {
            var name = req.body.name;
            var location = req.body.location;

            teleport.create(name, location, function(result) {
                res.redirect('/teleports');
            });
        });
        app.get('/teleports/:id', requireRole('teleports'), function(req, res) {
            teleport.findOne(req.params.id, function(result) {
                res.render('teleport_edit', {
                    title: 'Teleports',
                    description: 'Edit teleport preset',
                    breadcrumbs: [['/teleports', 'Teleports'], ['/teleports/' + result.name, result.username]],
                    teleport: result
                })
            });
        });
        app.put('/teleports/:id', requireRole('teleports'), function(req, res) {
            var name = req.body.name;
            var location = req.body.location;
            var id       = req.params.id;

            teleport.update(id, name, location, function() {
                res.redirect('/teleports');
            });
        });
        app.delete('/teleports/:id', requireRole('teleports'), function(req, res) {
            teleport.del(req.body.id, function(err, result) {
                if (err) res.send({error: err});
                else res.send({error: ''});
            });
        });

        app.get('/login', function(req, res) {
            res.render('login', {
                layout: false,
            });
        });
        app.post('/login', passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login' }));
        app.get('/logout', function(req, res){
            req.logout();
            res.redirect('/');
        });

        app.get('/connect', requireRole('connect'), routing.connect);
        app.get('/disconnect', requireRole('connect'), routing.disconnect);
        app.get('/status', routing.status);
        app.get('/restart', routing.restart);

        app.post('/chat', requireRole('chat'), routing.chat);
        app.post('/give', requireRole('give'), routing.give);
        app.post('/giveall', requireRole('giveall'), routing.giveall);
        app.post('/kick', requireRole('kick'), routing.kick);
        app.post('/online', routing.online);
        app.post('/execute', requireRole('execute'), routing.execute);
        app.post('/ban', requireRole('ban'), routing.ban);
        app.post('/banid', requireRole('ban'), routing.banid);
        app.post('/topos', requireRole('teleport'), routing.topos);
        app.post('/toplayer', requireRole('teleport'), routing.toplayer);
        app.post('/topreset', requireRole('teleport'), routing.topreset);

        io.sockets.on('connection', function (socket) {
            rconConnection.on("updateChat", function(message){
                socket.emit("updateChat", message);
            });

            rconConnection.on("updateConsole", function(message){
                socket.emit("updateConsole", message);
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
        callback(null, 'done');
    },
    function(err, result) {
        console.log('Started server on 127.0.0.1:3000');
    }
]);
