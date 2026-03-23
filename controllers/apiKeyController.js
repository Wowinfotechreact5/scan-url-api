const apiKeyModel = require("../models/apiKeyModel");
const crypto = require("crypto");
const activityModel = require("../models/ActivityLogModel");
const { logActivity } = require("../utils/activityLogger");
const db = require("../db");

const generateApiKey = () => {
    return crypto.randomBytes(16).toString("hex");
};

// exports.createApiKey = (req, res) => {
//     const userId = req.user.id;
//     const userEmail = req.user.email;
//     const requestIp = req.ip;
//     const { name } = req.body;

//     console.log("========== CREATE API KEY START ==========");
//     console.log("REQ USER:", req.user);
//     console.log("REQ BODY:", req.body);

//     if (!name) {
//         console.log("CREATE API KEY FAILED: name missing");
//         return res.status(400).json({
//             success: false,
//             message: "API key name required"
//         });
//     }

//     const apiKey = generateApiKey();
//     console.log("GENERATED API KEY:", apiKey);

//     // STEP 1: fetch plan + credits
//     const planQuery = `
//         SELECT 
//             u.id AS user_id,
//             u.plan_id,
//             p.id AS plan_table_id,
//             p.name AS plan_name,
//             p.credits
//         FROM tb_users u
//         LEFT JOIN tb_plans p ON u.plan_id = p.id
//         WHERE u.id = ?
//         LIMIT 1
//     `;

//     console.log("PLAN QUERY USER ID:", userId);

//     db.query(planQuery, [userId], (planErr, planResult) => {
//         console.log("PLAN QUERY ERROR:", planErr);
//         console.log("PLAN QUERY RESULT:", JSON.stringify(planResult, null, 2));

//         if (planErr) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Error while fetching user plan",
//                 debug: planErr.message
//             });
//         }

//         if (!planResult || !planResult.length) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User plan not found"
//             });
//         }

//         const userPlan = planResult[0];
//         const credits = Number(userPlan.credits || 0);

//         console.log("USER PLAN DATA:", userPlan);
//         console.log("RESOLVED CREDITS:", credits);

//         if (!credits || credits <= 0) {
//             console.log("INVALID PLAN CREDITS FOUND:", credits);
//             return res.status(400).json({
//                 success: false,
//                 message: "Plan credits are invalid or zero",
//                 debug: userPlan
//             });
//         }

//         // STEP 2: create API key
//         console.log("CALLING sp_create_api_key WITH:", {
//             userId,
//             name,
//             apiKey
//         });

//         apiKeyModel.createApiKey(userId, name, apiKey, (createErr, createResult) => {
//             console.log("CREATE API KEY ERROR:", createErr);
//             console.log("CREATE API KEY RAW RESULT:", JSON.stringify(createResult, null, 2));

//             if (createErr) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Database error while creating API key",
//                     debug: createErr.message
//                 });
//             }

//             // MySQL stored procedure result can come in different shapes.
//             let apiKeyId = null;

//             try {
//                 if (
//                     createResult &&
//                     createResult[0] &&
//                     Array.isArray(createResult[0]) &&
//                     createResult[0][0] &&
//                     createResult[0][0].id
//                 ) {
//                     apiKeyId = createResult[0][0].id;
//                 }
//             } catch (e) {
//                 console.log("ERROR READING apiKeyId FROM STORED PROCEDURE:", e.message);
//             }

//             console.log("EXTRACTED apiKeyId FROM SP RESULT:", apiKeyId);

//             // Fallback: if SP did not return inserted id, fetch it by api_key
//             const continueWithCreditUpdate = (resolvedApiKeyId) => {
//                 console.log("FINAL API KEY ID USED FOR CREDIT UPDATE:", resolvedApiKeyId);

//                 if (!resolvedApiKeyId) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "API key created but ID could not be resolved",
//                         debug: {
//                             createResult
//                         }
//                     });
//                 }

//                 console.log("CALLING sp_set_credit_limit WITH:", {
//                     userId,
//                     apiKeyId: resolvedApiKeyId,
//                     credits
//                 });

//                 apiKeyModel.setCreditLimit(userId, resolvedApiKeyId, credits, (creditErr, creditResult) => {
//                     console.log("SET CREDIT ERROR:", creditErr);
//                     console.log("SET CREDIT RESULT:", JSON.stringify(creditResult, null, 2));

//                     if (creditErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "API key created but credit assignment failed",
//                             debug: creditErr.message
//                         });
//                     }

//                     // Final DB check
//                     db.query(
//                         `SELECT id, user_id, api_key_name, credit_limit, used_credits 
//                          FROM tb_api_keys 
//                          WHERE id = ? LIMIT 1`,
//                         [resolvedApiKeyId],
//                         (verifyErr, verifyResult) => {
//                             console.log("VERIFY CREDIT ERROR:", verifyErr);
//                             console.log("VERIFY CREDIT RESULT:", JSON.stringify(verifyResult, null, 2));

//                             if (verifyErr) {
//                                 return res.status(500).json({
//                                     success: false,
//                                     message: "API key created, credit updated, but verification query failed",
//                                     apiKey,
//                                     apiKeyId: resolvedApiKeyId,
//                                     assignedCredits: credits,
//                                     debug: verifyErr.message
//                                 });
//                             }

//                             logActivity({
//                                 user_id: userId,
//                                 email: userEmail,
//                                 ip: requestIp,
//                                 event: "API_KEY_CREATE",
//                                 message: `API key created (${name}) with ${credits} credits`
//                             });

//                             console.log("========== CREATE API KEY SUCCESS ==========");

//                             return res.status(201).json({
//                                 success: true,
//                                 message: "API key created successfully",
//                                 apiKey,
//                                 apiKeyId: resolvedApiKeyId,
//                                 assignedCredits: credits,
//                                 dbRow: verifyResult[0] || null
//                             });
//                         }
//                     );
//                 });
//             };

//             if (apiKeyId) {
//                 return continueWithCreditUpdate(apiKeyId);
//             }

//             console.log("SP DID NOT RETURN ID. TRYING FALLBACK QUERY BY api_key...");

//             db.query(
//                 `SELECT id 
//                  FROM tb_api_keys 
//                  WHERE api_key = ? AND user_id = ?
//                  ORDER BY id DESC 
//                  LIMIT 1`,
//                 [apiKey, userId],
//                 (findErr, findResult) => {
//                     console.log("FALLBACK FIND ERROR:", findErr);
//                     console.log("FALLBACK FIND RESULT:", JSON.stringify(findResult, null, 2));

//                     if (findErr) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "API key created but unable to fetch inserted key id",
//                             debug: findErr.message
//                         });
//                     }

//                     if (!findResult || !findResult.length) {
//                         return res.status(500).json({
//                             success: false,
//                             message: "API key created but inserted row could not be found"
//                         });
//                     }

//                     apiKeyId = findResult[0].id;
//                     return continueWithCreditUpdate(apiKeyId);
//                 }
//             );
//         });
//     });
// };

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

    
    // STEP 1: get user plan + limits
    const query = `
        SELECT 
            u.plan_id,
            p.credits,
            p.max_api_keys
        FROM tb_users u
        JOIN tb_plans p ON u.plan_id = p.id
        WHERE u.id = ?
    `;

    db.query(query,[userId],(err,plan)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        const planData = plan[0];

        const credits = planData.credits;
        const maxKeys = planData.max_api_keys;

        
        // STEP 2: check how many keys user already has
        db.query(
            "SELECT COUNT(*) AS total FROM tb_api_keys WHERE user_id=?",
            [userId],
            (err,countResult)=>{

                if(err){
                    return res.status(500).json({success:false});
                }

                const totalKeys = countResult[0].total;

                
                if(totalKeys >= maxKeys){

                    return res.status(403).json({
                        success:false,
                        message:`API key limit reached. Your plan allows only ${maxKeys} API keys`
                    });

                }

                // STEP 3: create API key
                apiKeyModel.createApiKey(userId,name,apiKey,(err,result)=>{

                    if(err){
                        return res.status(500).json({
                            success:false
                        });
                    }

                    // get inserted key id
                    db.query(
                        "SELECT id FROM tb_api_keys WHERE api_key=? LIMIT 1",
                        [apiKey],
                        (err,find)=>{

                            const apiKeyId = find[0].id;

                            
                            // assign credits
                            apiKeyModel.setCreditLimit(
                                userId,
                                apiKeyId,
                                credits,
                                (err)=>{

                                    if(err){
                                        return res.status(500).json({
                                            success:false
                                        });
                                    }

                                    logActivity({
                                        user_id:userId,
                                        email:req.user.email,
                                        ip:req.ip,
                                        event:"API_KEY_CREATE",
                                        message:`API key created (${name})`
                                    });

                                    res.status(201).json({
                                        success:true,
                                        apiKey,
                                        credits
                                    });

                                }
                            );

                        }
                    );

                });

            }

        );

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
        user_id: null,
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

    console.log("DEBUG SET CREDIT:", { userId, id, credit });

    if (credit == null || credit < 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid credit value"
        });
    }

    apiKeyModel.setCreditLimit(userId, id, credit, (err, result) => {
        console.log("SET CREDIT DB RESULT:", JSON.stringify(result, null, 2));

        if (err) {
            console.log("SET CREDIT DB ERROR:", err);
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