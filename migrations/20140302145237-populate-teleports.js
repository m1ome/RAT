var dbm = require('db-migrate');
var async = require('async');
var type = dbm.dataType;

exports.up = function(db, callback) {
    async.series([
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Mt. Everust', '4500 485 -4400']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Radtown Upper', '5250 370 -4850']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Checkpoints', '5700 410 -4280']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Sheds', '6050 390 -4400']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Radtown Left', '6300 360 -4650']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Hangar', '6600 355 -4400']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Bunkers', '6410 385 -3880']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Old Radtown Gallons', '6690 355 -3880']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Resource Valley', '5000 460 -3000']),
        db.insert.bind(db, 'teleports', ['name', 'location'], ['Radtown Right', '6050 380 -3620'])
    ], callback);
};

exports.down = function(db, callback) {
    async.series([
         db.runSql.bind(db, "TRUNCATE TABLE `teleports`")
    ], callback);
};
