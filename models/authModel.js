
const db = require("../db.js");

exports.registerUser = (name, email, phone, password, token, callback) => {

    db.query(
        "CALL sp_register_user(?,?,?,?,?)",
        [name, email, phone, password, token],
        callback
    );

};

exports.getUserByEmail = (email, callback) => {
    db.query(
        "CALL sp_login_user(?)",
        [email],
        callback
    );
};

exports.updatePassword = (email, password, callback) => {
    db.query(
        "CALL sp_change_password(?,?)",
        [email, password],
        callback
    );
};

exports.deleteUser = (userId, callback) => {
    db.query(
        "CALL sp_delete_user(?)",
        [userId],
        callback
    );
};

exports.deleteUser = (userId, callback) => {

    db.query(
        "CALL sp_delete_user(?)",
        [userId],
        callback
    );

};

exports.changeEmail = (userId, newEmail, callback) => {

    db.query(
        "CALL sp_change_email(?,?)",
        [userId, newEmail],
        callback
    );

};

exports.saveResetToken = (email, token, callback) => {

    db.query(
        "UPDATE tb_users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?",
        [token, email],
        callback
    );

};

exports.resetPassword = (token, password, callback) => {

    db.query(
        `UPDATE tb_users 
         SET password = ?, reset_token = NULL, reset_token_expiry = NULL
         WHERE reset_token = ? AND reset_token_expiry > NOW()`,
        [password, token],
        callback
    );

};