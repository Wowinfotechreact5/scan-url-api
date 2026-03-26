const activityModel = require("../models/ActivityLogModel");

exports.getActivityLogs = (req, res) => {

    const {
        page = 1,
        limit = 10,
        type,
        email,
        startDate,
        endDate,
        search,
        event
    } = req.body;

    const offset = (page - 1) * limit;

    activityModel.getActivityLogs(
        {
            limit: Number(limit),
            offset: Number(offset),
            type,
            email,
            startDate,
            endDate,
            search,
            event
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            res.status(200).json({
                success: true,
                data: result
            });
        }
    );
};