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

    if (filters.type === "auth") {
        query += ` AND (
            event LIKE 'AUTH_%'
            OR event LIKE 'LOGIN_%'
        )`;
    }

    if (filters.type === "credit") {
        query += ` AND (
            event LIKE 'API_KEY_%'
            OR event LIKE 'CREDIT_%'
            OR event LIKE 'WALLET_%'
        )`;
    }
    if (filters.type === "credit") {
    query += ` AND (
        event LIKE 'API_KEY_%'
        OR event LIKE 'CREDIT_%'
        OR event LIKE 'PLAN_%'
        OR event LIKE 'WALLET_%'
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

    // show all logs
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