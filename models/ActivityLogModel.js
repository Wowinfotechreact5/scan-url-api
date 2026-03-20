const db = require("../db");

// ✅ define function
const addActivityLog = (data, callback) => {
    const { user_id, email, ip, event, message } = data;

    db.query(
        "CALL sp_add_activity_log(?, ?, ?, ?, ?)",
        [user_id, email, ip, event, message],
        callback
    );
};

// ✅ define function properly
const getActivityLogs = (data, callback) => {
    const { limit, offset, event, email, startDate, endDate } = data;

    db.query(
        "CALL sp_get_activity_logs(?, ?, ?, ?, ?, ?)",
        [
            limit,
            offset,
            event || null,
            email || null,
            startDate || null,
            endDate || null
        ],
        callback
    );
};

// ✅ export properly
module.exports = {
    addActivityLog,
    getActivityLogs
};