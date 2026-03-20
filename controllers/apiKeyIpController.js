const apiKeyIpModel = require("../models/apiKeyIpModel");
const { logActivity } = require("../utils/activityLogger");

exports.addIp = (req, res) => {
    const userId = req.user.id;
    const email = req.user.email;
    const ipAddress = req.ip;

    const { apiKeyId, ip } = req.body;

    if (!ip) {
        return res.status(400).json({
            success: false,
            message: "IP address required"
        });
    }

    apiKeyIpModel.addIp(userId, apiKeyId, ip, (err, result) => {

        if (err) {
            return res.status(500).json({ success: false });
        }

        // 🔥 LOG
        logActivity({
            user_id: userId,
            email,
            ip: ipAddress,
            event: "API_KEY_IP_ADD",
            message: `IP ${ip} added to API key ID ${apiKeyId}`
        });

        res.json({
            success: true,
            message: "IP added"
        });

    });
};


exports.getIps = (req,res)=>{

    const { apiKeyId } = req.params;

    apiKeyIpModel.getIps(apiKeyId,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            data: result[0]
        });

    });

};


exports.deleteIp = (req, res) => {
    const userId = req.user.id;
    const email = req.user.email;
    const ipAddress = req.ip;

    const { id, ip } = req.body; // send ip also for better logs

    apiKeyIpModel.deleteIp(userId, id, (err, result) => {

        if (err) {
            return res.status(500).json({ success: false });
        }

        // 🔥 LOG
        logActivity({
            user_id: userId,
            email,
            ip: ipAddress,
            event: "API_KEY_IP_DELETE",
            message: `IP ${ip || id} removed`
        });

        res.json({
            success: true,
            message: "IP removed"
        });

    });
};