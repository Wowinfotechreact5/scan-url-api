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

    // get credits of selected plan
    db.query(
        "SELECT credits FROM tb_plans WHERE id=?",
        [planId],
        (err, planResult) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!planResult.length) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid plan"
                });
            }

            const credits = planResult[0].credits;

            // update user plan + wallet
            db.query(
                `UPDATE tb_users
                 SET plan_id = ?, 
                     credits_total = ?, 
                     credits_used = 0
                 WHERE id = ?`,
                [planId, credits, userId],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to upgrade plan"
                        });
                    }

                    logActivity({
    user_id: userId,
    email: req.user.email,
    ip: req.ip,
    event: "PLAN_UPGRADE",
    message: `User upgraded to plan ${planId} with ${credits} credits`
});

res.json({
    success: true,
    message: "Plan upgraded successfully",
    plan_id: planId,
    credits_total: credits
});

                }
            );

        }
    );

};