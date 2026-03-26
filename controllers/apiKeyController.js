const apiKeyModel = require("../models/apiKeyModel");
const crypto = require("crypto");
const activityModel = require("../models/ActivityLogModel");
const { logActivity } = require("../utils/activityLogger");
const db = require("../db");
const creditCache = require("../utils/creditCache");
const axios = require("axios");
const generateApiKey = () => {
    return crypto.randomBytes(16).toString("hex");
};

const runDeepScan = async (url) => {

    const response = await axios.post(
        "https://mlscanurlapi.uat.scanurl.ai/deep-scan",
        {
            url: url
        },
        {
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 60000
        }
    );

    return response.data;
};


exports.createApiKey = (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "API key name required"
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

        const row = result?.[0]?.[0];

        if (!row) {
            return res.status(500).json({
                success: false,
                message: "Invalid stored procedure response"
            });
        }

        if (row.status === 0) {
            return res.status(403).json({
                success: false,
                message: row.message
            });
        }

        logActivity({
            user_id: userId,
            email: req.user.email,
            ip: req.ip,
            event: "API_KEY_CREATE",
            message: `API key created (${name})`
        });

        return res.status(201).json({
            success: true,
            message: row.message,
            apiKey,
            apiKeyId: row.id,
            credit_limit: 1000
        });
    });
};
exports.getApiKeys = (req, res) => {
    const userId = req.user.id;

    apiKeyModel.getApiKeys(userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true,
            data: result[0]
        });
    });
};

exports.changeName = (req, res) => {
    const userId = req.user.id;
    const { id, name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "API key name required"
        });
    }

    apiKeyModel.updateName(userId, id, name, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
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
            success: true,
            message: "Name updated"
        });
    });
};

exports.regenerateKey = (req, res) => {
    const userId = req.user.id;
    const { id } = req.body;

    const newKey = generateApiKey();

    apiKeyModel.regenerateKey(userId, id, newKey, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        logActivity({
            user_id: userId,
            email: req.user.email,
            ip: req.ip,
            event: "API_KEY_REGENERATE",
            message: `API key regenerated (ID: ${id})`
        });

        res.json({
            success: true,
            apiKey: newKey
        });
    });
};

exports.deleteKey = (req, res) => {
    const userId = req.user.id;
    const { id } = req.body;

    apiKeyModel.deleteKey(userId, id, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false });
        }

        logActivity({
            user_id: userId,
            email: req.user.email,
            ip: req.ip,
            event: "API_KEY_DELETE",
            message: `API key deleted (ID: ${id})`
        });

        res.json({
            success: true,
            message: "API key deleted"
        });
    });
};

exports.scanUrl = (req, res) => {

    const apiKey = req.headers["x-api-key"];
    const { url } = req.body;

    if (!apiKey) {
        console.log("ERROR: API key missing");
        return res.status(401).json({
            success:false,
            message:"API key required"
        });
    }

    if (!url) {
        console.log("ERROR: URL missing");
        return res.status(400).json({
            success:false,
            message:"URL required"
        });
    }

    console.log("Calling consumeCredit...");

    // consume 1 credit per API call
    apiKeyModel.consumeCredit(apiKey,1,(err,result)=>{

        console.log("consumeCredit RESULT:", result);
        console.log("consumeCredit ERROR:", err);

        if(err){
            console.log("ERROR: consumeCredit failed");
            return res.status(500).json({
                success:false
            });
        }

        const response = result[0][0];

        console.log("consumeCredit RESPONSE:", response);

        if(response.status === 0){
            console.log("ERROR: Credit limit exceeded or invalid key");
            return res.status(403).json({
                success:false,
                message:response.message
            });
        }

        console.log("Credit consumed successfully. Starting scan...");

        processScan();

    });


   async function processScan() {

    try{

        console.log("Running fakeScan...");
       
       const scanResult = await runDeepScan(url);

        console.log("Scan Result:", scanResult);

        logActivity({
            user_id:null,
            email:null,
            ip:req.ip,
            event:"CREDIT_CONSUMED",
            message:"1 API credit consumed for URL scan"
        });

        console.log("Saving API usage log...");

        db.query(
`INSERT INTO tb_api_usage_logs
(api_key_id, endpoint, request_url, response_data, event, ip_address)
VALUES (?, ?, ?, ?, ?, ?)`,
[
apiKey,
"/api/apikey/v1/url-scan",
url,
JSON.stringify(scanResult),
"API_REQUEST",
req.ip
],
(err,result)=>{

    if(err){
        console.log("API LOG ERROR:",err);
    }else{
        const apiUsageId = result.insertId;

        console.log("API USAGE ID:", apiUsageId);

        logActivity({
            user_id:null,
            email:null,
            ip:req.ip,
            event:"CREDIT_CONSUMED",
            message:`1 API credit consumed for URL scan | usage_id:${apiUsageId}`
        });
    }

});

        return res.json({
            success:true,
            data:scanResult
        });

    }catch(error){

        console.log("SCAN ERROR:", error);

        return res.status(500).json({
            success:false,
            message:"Scan failed"
        });

    }

}

};
exports.setCreditLimit = (req, res) => {

    const userId = req.user.id;
    const { id, credit } = req.body;

    if (credit == null || credit < 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid credit value"
        });
    }

    apiKeyModel.setCreditLimit(userId, id, credit, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        const response = result[0][0];

        if (response.status === 0) {
            return res.status(400).json({
                success: false,
                message: response.message
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
            message: response.message
        });

    });

};



exports.getApiKeyLimit = (req,res)=>{

    const userId = req.user.id;

    apiKeyModel.getApiKeyLimit(userId,(err,result)=>{

        if(err){
            return res.status(500).json({
                success:false
            });
        }

        const data = result[0][0];

        res.json({
            success:true,
            plan:data.plan_name,
            api_keys_used:data.used_api_keys,
            api_keys_limit:data.max_api_keys
        });

    });

};