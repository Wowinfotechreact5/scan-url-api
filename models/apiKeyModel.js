const db = require("../db");


exports.createApiKey = (userId, name, apiKey, callback) => {
    db.query(
        "CALL sp_create_api_key(?,?,?)",
        [userId, name, apiKey],
        callback
    );
};

exports.getApiKeys = (userId, callback) => {

    db.query(
        "CALL sp_get_api_keys(?)",
        [userId],
        callback
    );

};
exports.updateName = (userId, id, name, callback) => {

    db.query(
        "CALL sp_update_api_key_name(?,?,?)",
        [userId, id, name],
        callback
    );

};
exports.regenerateKey = (userId, id, newKey, callback) => {

    db.query(
        "CALL sp_regenerate_api_key(?,?,?)",
        [userId, id, newKey],
        callback
    );

};

exports.deleteKey = (userId, id, callback) => {

    db.query(
        "CALL sp_delete_api_key(?,?)",
        [userId, id],
        callback
    );

};