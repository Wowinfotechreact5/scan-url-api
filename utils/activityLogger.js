const activityModel = require("../models/ActivityLogModel");

exports.logActivity = (data) => {
    activityModel.addActivityLog(data, () => {});
};