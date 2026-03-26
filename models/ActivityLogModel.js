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
       TYPE FILTER
    ================================*/
    if (filters.type === "auth") {
        query += ` AND event IN (
            'LOGIN_SUCCESS','LOGIN_FAILED',
            'AUTH_CHANGE_PASSWORD','AUTH_CHANGE_PASSWORD_FAILED',
            'AUTH_CHANGE_EMAIL',
            'AUTH_FORGOT_PASSWORD','AUTH_FORGOT_PASSWORD_FAILED',
            'API_KEY_CREATE','API_KEY_UPDATE',
            'API_KEY_REGENERATE','API_KEY_DELETE',
            'API_KEY_SET_CREDIT','API_KEY_IP_ADD','API_KEY_IP_DELETE'
        )`;
    }

    if (filters.type === "subscription") {
        query += ` AND event IN ('PLAN_UPGRADE')`;
    }

    if (filters.type === "api") {
        query += ` AND event IN (
            'API_KEY_CONSUME',
            'CREDIT_CONSUMED',
            'API_REQUEST',
            'CREDIT_LIMIT_EXCEEDED'
        )`;
    }

    /* ===============================
       EXTRA FILTERS
    ================================*/

    if (filters.event) {
        query += ` AND event = ?`;
        params.push(filters.event);
    }

    if (filters.email) {
        query += ` AND email = ?`;
        params.push(filters.email);
    }

    if (filters.ip) {
        query += ` AND ip_address = ?`;
        params.push(filters.ip);
    }

    if (filters.startDate) {
        query += ` AND created_at >= ?`;
        params.push(filters.startDate);
    }

    if (filters.endDate) {
        query += ` AND created_at <= ?`;
        params.push(filters.endDate);
    }

    /* ===============================
       GLOBAL SEARCH (🔥 powerful)
    ================================*/
    if (filters.search) {
        query += ` AND (
            message LIKE ? OR
            email LIKE ? OR
            event LIKE ?
        )`;
        const searchValue = `%${filters.search}%`;
        params.push(searchValue, searchValue, searchValue);
    }

    /* ===============================
       SORTING (safe)
    ================================*/

    const allowedSort = ["id", "created_at", "event", "email"];
    const sortBy = allowedSort.includes(filters.sortBy) ? filters.sortBy : "id";
    const order = filters.order === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortBy} ${order}`;

    /* ===============================
       PAGINATION
    ================================*/

    query += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit);
    params.push(filters.offset);

    db.query(query, params, callback);
};


/* ===============================
   EXPORT
================================ */

module.exports = {
    addActivityLog,
    getActivityLogs
};