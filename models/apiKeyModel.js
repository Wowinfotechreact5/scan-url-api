const db = require("../db");

exports.createApiKey = (userId, name, apiKey, callback) => {
    console.log("MODEL createApiKey:", { userId, name, apiKey });

    db.query(
        "CALL sp_create_api_key(?,?,?)",
        [userId, name, apiKey],
        (err, result) => {
            console.log("MODEL createApiKey ERROR:", err);
            console.log("MODEL createApiKey RESULT:", JSON.stringify(result, null, 2));
            callback(err, result);
        }
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

exports.setCreditLimit = (userId, id, credit, callback) => {
    console.log("MODEL setCreditLimit:", { userId, id, credit });

    db.query(
        "CALL sp_set_credit_limit(?,?,?)",
        [userId, id, credit],
        (err, result) => {
            console.log("MODEL setCreditLimit ERROR:", err);
            console.log("MODEL setCreditLimit RESULT:", JSON.stringify(result, null, 2));
            callback(err, result);
        }
    );
};

exports.consumeCredit = (apiKey, callback) => {
    db.query(
        "CALL sp_consume_credit(?)",
        [apiKey],
        callback
    );
};

exports.getApiKeyLimit = (userId, callback) => {

    db.query(
        "CALL sp_get_api_key_limit(?)",
        [userId],
        callback
    );

};