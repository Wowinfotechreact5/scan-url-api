const db = require("../db");
const activityModel = require("../models/activityModel");

exports.getApiUsageLogs = (req, res) => {

    activityModel.getApiUsageLogs({}, (err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            data:result
        });

    });

};


exports.getApiUsageLogById = (req, res) => {

    const id = req.params.id;

    db.query(
        `SELECT
            id,
            api_key_id,
            endpoint,
            request_url,
            response_data,
            event,
            created_at
        FROM tb_api_usage_logs
        WHERE id = ?`,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            if (!result.length) {
                return res.status(404).json({
                    success: false,
                    message: "Log not found"
                });
            }

            res.json({
                success: true,
                data: result[0]
            });

        }
    );

};