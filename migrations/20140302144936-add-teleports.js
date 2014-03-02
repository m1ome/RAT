var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('teleports', {
        id: {type:'int', primaryKey: true, autoIncrement: true},
        name: {type:'string', unique: true},
        location: {type:'text'}
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable('teleports', callback);
};
