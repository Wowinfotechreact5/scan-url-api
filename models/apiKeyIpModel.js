const db = require("../db");

exports.addIp = (userId, apiKeyId, ip, callback) => {

    db.query(
        "CALL sp_add_api_ip(?,?,?)",
        [userId, apiKeyId, ip],
        callback
    );

};

exports.getIps = (apiKeyId, callback) => {

    db.query(
        "CALL sp_get_api_ips(?)",
        [apiKeyId],
        callback
    );

};

exports.deleteIp = (userId, ipId, callback) => {

    db.query(
        "CALL sp_delete_api_ip(?,?)",
        [userId, ipId],
        callback
    );

};