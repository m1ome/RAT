var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('admins', {
        id: {type:'int', primaryKey: true, autoIncrement: true},
        username: {type:'string', unique: true},
        password: {type:'string'},
        roles: {type:'text'},
        is_root: {type:'boolean', defaultValue:0}
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable('admins', callback);
};
