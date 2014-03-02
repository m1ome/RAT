var create = function(name, location, callback) {
    databaseConnection.query("INSERT INTO `teleports` SET `name`=?, `location`=?", [name, location], function(err, result) { 
        callback(result);
    });
}

var update = function(id, name, location, callback) {
    databaseConnection.query("UPDATE `teleports` SET `name`=?, `location`=? WHERE `id`=?", [name, location, id], function(err, result) {
        callback(result);
    });
}

var del = function(id, callback) {
    databaseConnection.query("DELETE FROM `teleports` WHERE `id`=?", [id], function(err, result) {
        callback(null, result);
    });       
}

var findAll = function(callback) {
    databaseConnection.query("SELECT * FROM `teleports`", function(err, result) {
        callback(result);
    });
}

var findOne = function(id, callback) {
    databaseConnection.query("SELECT * FROM `teleports` WHERE `id`=?", [id], function(err, result) {
        if (result.length > 0) {
            callback(result[0]);
        } else callback(false);
    });
}

module.exports = {
    create: create,
    update: update,
    del: del,
    findAll: findAll,
    findOne: findOne
}