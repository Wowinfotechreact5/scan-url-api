const apiKeyModel = require("../models/apiKeyModel");
const crypto = require("crypto");
const activityModel = require("../models/ActivityLogModel");
const { logActivity } = require("../utils/activityLogger");
const generateApiKey = () => {
    return crypto.randomBytes(16).toString("hex");
};

exports.createApiKey = (req, res) => {

    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success:false,
            message:"API key name required"
        });
    }

    const apiKey = generateApiKey();

   apiKeyModel.createApiKey(userId, name, apiKey, (err, result) => {

    if (err) {
        return res.status(500).json({
            success: false,
            message: "Database error"
        });
    }

    // create LOG
    logActivity({
        user_id: userId,
        email: req.user.email,
        ip: req.ip,
        event: "API_KEY_CREATE",
        message: `API key created (${name})`
    });

    res.status(201).json({
        success: true,
        apiKey
    });
});

};
exports.getApiKeys = (req,res)=>{

    const userId = req.user.id;

    apiKeyModel.getApiKeys(userId,(err,result)=>{

        if(err){
            return res.status(500).json({
                success:false
            });
        }

        res.json({
            success:true,
            data:result[0]
        });

    });

};

exports.changeName = (req,res)=>{

    const userId = req.user.id;
    const { id, name } = req.body;

    if(!name){
        return res.status(400).json({
            success:false,
            message:"API key name required"
        });
    }

    apiKeyModel.updateName(userId,id,name,(err,result)=>{

        if(err){
            return res.status(500).json({
                success:false,
                message:"Database error"
            });
        }
logActivity({
    user_id: userId,
    email: req.user.email,
    ip: req.ip,
    event: "API_KEY_UPDATE",
    message: `API key name updated (${name})`
});
        res.json({
            success:true,
            message:"Name updated"
        });

    });

};

exports.regenerateKey = (req,res)=>{

    const userId = req.user.id;
    const { id } = req.body;

    const newKey = generateApiKey();

    apiKeyModel.regenerateKey(userId,id,newKey,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }
logActivity({
    user_id: userId,
    email: req.user.email,
    ip: req.ip,
    event: "API_KEY_REGENERATE",
    message: `API key regenerated (ID: ${id})`
});
        res.json({
            success:true,
            apiKey:newKey
        });

    });

};
exports.deleteKey = (req,res)=>{

    const userId = req.user.id;
    const { id } = req.body;

    apiKeyModel.deleteKey(userId,id,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }
logActivity({
    user_id: userId,
    email: req.user.email,
    ip: req.ip,
    event: "API_KEY_DELETE",
    message: `API key deleted (ID: ${id})`
});
        res.json({
            success:true,
            message:"API key deleted"
        });

    });

};
const fakeScan = async (url) => {
    return {
        url,
        safe: true,
        score: Math.floor(Math.random() * 100)
    };
};
exports.scanUrl = (req, res) => {
    const apiKey = req.headers["x-api-key"];
    const { url } = req.body;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key required"
        });
    }
logActivity({
    user_id: null, // or fetch from DB if needed
    email: null,
    ip: req.ip,
    event: "API_KEY_CONSUME",
    message: `API used for URL scan (${url})`
});
    if (!url) {
        return res.status(400).json({
            success: false,
            message: "URL required"
        });
    }

    // Step 1: consume credit
    apiKeyModel.consumeCredit(apiKey, async (err, result) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        const response = result[0][0];

        if (response.status === 0) {
            return res.status(403).json({
                success: false,
                message: response.message
            });
        }

        try {
            // Step 2: call your internal/external scan API
            const scanResult = await fakeScan(url);

            return res.json({
                success: true,
                data: scanResult
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Scan failed"
            });
        }
    });
};


exports.setCreditLimit = (req, res) => {
    const userId = req.user.id;
    const { id, credit } = req.body;

    console.log("DEBUG:", { userId, id, credit });

    if (credit == null || credit < 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid credit value"
        });
    }

    apiKeyModel.setCreditLimit(userId, id, credit, (err, result) => {
        console.log("DB RESULT:", result);

        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }
        logActivity({
    user_id: userId,
    email: req.user.email,
    ip: req.ip,
    event: "API_KEY_SET_CREDIT",
    message: `Credit set to ${credit} (ID: ${id})`
});

        res.json({
            success: true,
            message: "Credit limit updated"
        });
    });
};