const db = require("../db");

exports.getDashboard = async (req, res) => {
    const userId = req.user.id;

    try {
       const summaryQuery = `
SELECT 
    u.credits_total AS total_credit,

    (
        SELECT IFNULL(SUM(used_credits),0)
        FROM tb_api_keys
        WHERE user_id = ?
    ) AS used_credit,

    (
        SELECT COUNT(*)
        FROM tb_api_keys
        WHERE user_id = ?
    ) AS active_api_keys

FROM tb_users u
WHERE u.id = ?
LIMIT 1
`;

        const dailyUsageQuery = `
            SELECT 
                DATE(created_at) AS usage_date,
                COUNT(*) AS credits_used
            FROM tb_api_usage_logs
            WHERE user_id = ?
            GROUP BY DATE(created_at)
            ORDER BY usage_date DESC
            LIMIT 30
        `;

       db.query(summaryQuery, [userId, userId, userId], (err, summaryResult) => {
            if (err) {
                console.log("DASHBOARD SUMMARY ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: err.message
                });
            }

            db.query(dailyUsageQuery, [userId], (err2, dailyUsageResult) => {
                if (err2) {
                    console.log("DASHBOARD DAILY USAGE ERROR:", err2);
                    return res.status(500).json({
                        success: false,
                        message: "Database error",
                        error: err2.message
                    });
                }

                const summary = summaryResult[0] || {
                    total_credit: 0,
                    used_credit: 0,
                    active_api_keys: 0
                };

                return res.json({
                    success: true,
                    dashboard: {
                        total_credit: Number(summary.total_credit || 0),
                        used_credit: Number(summary.used_credit || 0),
                        remaining_credit:
                            Number(summary.total_credit || 0) - Number(summary.used_credit || 0),
                        active_api_keys: Number(summary.active_api_keys || 0)
                    },
                    daily_usage: dailyUsageResult || []
                });
            });
        });
    } catch (error) {
        console.log("DASHBOARD CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};