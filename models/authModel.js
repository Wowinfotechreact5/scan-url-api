
const db = require("../db.js");

exports.registerUser = (name, email, phone, password, callback) => {
    db.query(
        "CALL sp_register_user(?,?,?,?)",
        [name, email, phone, password],
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