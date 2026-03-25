const db = require("../db");

/* ===============================
   ADD ACTIVITY LOG
================================ */

const addActivityLog = (data, callback) => {

    const { user_id, email, ip, event, message } = data;

    db.query(
        "CALL sp_add_activity_log(?, ?, ?, ?, ?)",
        [user_id, email, ip, event, message],
        callback
    );

};


/* ===============================
   GET ACTIVITY LOGS
================================ */

const getActivityLogs = (filters, callback) => {

    let query = `
        SELECT *
        FROM tb_activity_logs
        WHERE 1=1
    `;

    const params = [];

    /* ===============================
       AUTH SECTION
    ================================*/

 if (filters.type === "auth") {
    query += ` AND event IN (
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'AUTH_CHANGE_PASSWORD',
        'AUTH_CHANGE_PASSWORD_FAILED',
        'AUTH_CHANGE_EMAIL',
        'AUTH_FORGOT_PASSWORD',
        'AUTH_FORGOT_PASSWORD_FAILED',
        'API_KEY_CREATE',
        'API_KEY_UPDATE',
        'API_KEY_REGENERATE',
        'API_KEY_DELETE',
        'API_KEY_SET_CREDIT',
        'API_KEY_IP_ADD',
        'API_KEY_IP_DELETE'
    )`;
}

/* ===============================
   SUBSCRIPTION SECTION
================================*/

if (filters.type === "subscription") {
    query += ` AND event IN (
        'PLAN_UPGRADE'
    )`;
}

/* ===============================
   API USAGE SECTION
================================*/

if (filters.type === "api") {
    query += ` AND event IN (
        'API_KEY_CONSUME',
        'CREDIT_CONSUMED',
        'API_REQUEST',
        'CREDIT_LIMIT_EXCEEDED'
    )`;
}

    if (filters.email) {
        query += ` AND email = ?`;
        params.push(filters.email);
    }

    if (filters.startDate) {
        query += ` AND created_at >= ?`;
        params.push(filters.startDate);
    }

    if (filters.endDate) {
        query += ` AND created_at <= ?`;
        params.push(filters.endDate);
    }

    query += ` ORDER BY id DESC`;

    db.query(query, params, callback);

};


/* ===============================
   EXPORT
================================ */

module.exports = {
    addActivityLog,
    getActivityLogs
};