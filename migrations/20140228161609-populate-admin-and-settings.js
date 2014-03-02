var dbm   = require('db-migrate');
var type  = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
    async.series([
        db.insert.bind(db, 'settings', ['name', 'value'], ['config.debug', 'false']),
        db.insert.bind(db, 'settings', ['name', 'value'], ['config.nologin', 'false']),
        db.insert.bind(db, 'settings', ['name', 'value'], ['rust.host', '127.0.0.1']),
        db.insert.bind(db, 'settings', ['name', 'value'], ['rust.password', '']),
        db.insert.bind(db, 'settings', ['name', 'value'], ['rust.port', '0']),
        db.insert.bind(db, 'admins', ['id', 'username', 'password', 'roles', 'is_root'], ['1', 'admin', '123', '[\"root\"]', '1'])
    ], callback);
};

exports.down = function(db, callback) {
    async.series([
         db.runSql.bind(db, "TRUNCATE TABLE `admins`"),
         db.runSql.bind(db, "TRUNCATE TABLE `settings`")
    ], callback);
};
