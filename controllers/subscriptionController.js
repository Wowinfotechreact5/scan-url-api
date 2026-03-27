const db = require("../db");
const { logActivity } = require("../utils/activityLogger");
/* ===============================
   GET ALL PLANS
================================ */

exports.getPlans = (req, res) => {

   
    db.query(
        "SELECT id,name,credits,price FROM tb_plans ORDER BY id",
        (err, result) => {

          
            if (err) {
                return res.status(500).json({
                    success:false,
                    message:"Database error"
                });
            }

            res.json({
                success:true,
                data:result
            });

        }
    );

};


/* ===============================
   GET USER CURRENT PLAN
================================ */

exports.getUserPlan = (req, res) => {

    const userId = req.user.id;

    
    db.query(
        `SELECT 
            u.id AS user_id,
            u.plan_id,
            p.name,
            p.credits,
            p.price
         FROM tb_users u
         JOIN tb_plans p ON u.plan_id = p.id
         WHERE u.id = ?`,
        [userId],
        (err,result)=>{

           
            if(err){
                return res.status(500).json({
                    success:false
                });
            }

            res.json({
                success:true,
                data:result[0]
            });

        }
    );

};


/* ===============================
   UPGRADE PLAN
================================ */

exports.upgradePlan = (req, res) => {

    const userId = req.user.id;
    const { planId } = req.body;

    if (!planId) {
        return res.status(400).json({
            success: false,
            message: "planId required"
        });
    }

    db.query(
        "SELECT credits FROM tb_plans WHERE id=?",
        [planId],
        (err, planResult) => {

            if (err) return res.status(500).json({ success:false });

            const credits = planResult[0].credits;

            // 1️⃣ expire old subscription
            db.query(
                `UPDATE tb_user_subscription 
                 SET status='EXPIRED' 
                 WHERE user_id=? AND status='ACTIVE'`,
                [userId],
                (err) => {

                    if (err) return res.status(500).json({ success:false });

                    // 2️⃣ insert new subscription
                    db.query(
                        `INSERT INTO tb_user_subscription
                        (user_id, plan_id, start_date, end_date, status, created_at)
                        VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'ACTIVE', NOW())`,
                        [userId, planId],
                        (err) => {

                            if (err) return res.status(500).json({ success:false });

                            // 3️⃣ update user wallet
                            db.query(
                                `UPDATE tb_users
                                 SET plan_id=?, credits_total=?, credits_used=0
                                 WHERE id=?`,
                                [planId, credits, userId],
                                (err) => {

                                    if (err) return res.status(500).json({ success:false });

                                    res.json({
                                        success: true,
                                        message: "Plan upgraded successfully"
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};




exports.getSubscriptionDetails = (req, res) => {

    const userId = req.user.id;

    db.query(
        `SELECT 
            s.start_date,
            s.end_date,
            s.status,
            s.plan_id,
            p.name AS plan_name,
            p.credits AS monthly_credits,
            u.credits_total,
            u.credits_used
        FROM tb_user_subscription s
        JOIN tb_plans p ON s.plan_id = p.id
        JOIN tb_users u ON u.id = s.user_id
        WHERE s.user_id = ? 
        AND s.status = 'ACTIVE'
        ORDER BY s.id DESC
        LIMIT 1`,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!result.length) {
                return res.status(404).json({
                    success: false,
                    message: "No active subscription found"
                });
            }

            const data = result[0];

            // ===============================
            // API KEY QUOTA LOGIC
            // ===============================
            let apiKeysQuota = 2;
            if (data.plan_id == 2) apiKeysQuota = 5;
            if (data.plan_id == 3) apiKeysQuota = 10;

            // ===============================
            // DATE CALCULATIONS
            // ===============================
            const startDate = new Date(data.start_date);

            let endDate;

            if (data.end_date) {
                endDate = new Date(data.end_date);
            } else {
                // default monthly
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
            }

            // credits reset (monthly)
            const lastReset = new Date(startDate);

            const nextReset = new Date(lastReset);
            nextReset.setMonth(nextReset.getMonth() + 1);

            // ===============================
            // FORMAT FUNCTION
            // ===============================
            const formatDate = (date) => {
                return date.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric"
                });
            };

            res.json({
                success: true,
                data: {
                    first_created: formatDate(startDate),
                    selected_plan: data.plan_name,
                    type: "Custom",
                    monthly_credits: data.monthly_credits,
                    api_keys_quota: `${apiKeysQuota} API Keys`,
                    status: data.status,
                    expiration: formatDate(endDate),
                    renewal_interval: "Monthly",
                    credits_last_reset: formatDate(lastReset),
                    credits_next_reset: formatDate(nextReset),

                    // BONUS (useful for dashboard)
                    credits_total: data.credits_total,
                    credits_used: data.credits_used,
                    credits_remaining: data.credits_total - data.credits_used
                }
            });

        }
    );

};