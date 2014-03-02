var create = function(name, password, roles, callback) {
    databaseConnection.query("INSERT INTO `admins` SET `username`=?, `password`=?", [name, password], function(err, result) { 
        saveRoles(result.insertId, roles, function(result) {
            callback(result);
        });
    });
}

var update = function(id, name, password, roles, callback) {
    databaseConnection.query("UPDATE `admins` SET `password`=?, `username`=? WHERE `id`=?", [password, name, id], function(err, result) {
        saveRoles(id, roles, function(result) {
            callback(result);
        });
    });
}

var del = function(id, callback) {
    databaseConnection.query("SELECT COUNT(*) as `count` FROM `admins`", function(err, result) {
        if (result[0].count > 1) {
            databaseConnection.query("DELETE FROM `admin` WHERE `id`=?", [id], function(err, result) {
                callback(null, result);
            });            
        } else {
            callback('You must have at least one admin!', false);
        }
    });
}

var findAll = function(callback) {
    databaseConnection.query("SELECT * FROM `admins`", function(err, result) {
        callback(result);
    });
}

var findOne = function(id, callback) {
    databaseConnection.query("SELECT * FROM `admins` WHERE `id`=?", [id], function(err, result) {
        if (result.length > 0) {
            result[0].roles = JSON.parse(result[0].roles);  
            callback(result[0]);
        } else callback(false);
    });
}

var saveRoles = function(id, roles, callback) {
    findOne(id, function(user) {
        if (user) {
            if (user.is_root == '1') roles = ['root'];
            databaseConnection.query("UPDATE `admins` SET `roles`=? WHERE `id`=?", [JSON.stringify(roles), id], function(err, result) {
                callback(result);
            });
        } else {
            callback(false);
        }
    });
}

module.exports = {
    roles: ['connect', 'ban', 'kick', 'teleport', 'give', 'giveall', 'execute', 'settings', 'admins'],
    create: create,
    update: update,
    del: del,
    findAll: findAll,
    findOne: findOne,
    saveRoles: saveRoles
}