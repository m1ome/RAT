var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('settings', {
        name : {type: 'string', unique:true},
        value: {type: 'string'}
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable('settings', callback);
};
