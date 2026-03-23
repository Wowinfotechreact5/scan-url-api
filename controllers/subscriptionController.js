const db = require("../db");

/* ===============================
   GET ALL PLANS
================================ */

exports.getPlans = (req, res) => {

    console.log("GET PLANS CALLED");

    db.query(
        "SELECT id,name,credits,price FROM tb_plans ORDER BY id",
        (err, result) => {

            console.log("PLAN QUERY ERROR:", err);
            console.log("PLAN QUERY RESULT:", result);

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

    console.log("GET USER PLAN USER:", userId);

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

            console.log("USER PLAN ERROR:",err);
            console.log("USER PLAN RESULT:",result);

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

exports.upgradePlan = (req,res)=>{

    const userId = req.user.id;
    const { planId } = req.body;

    console.log("UPGRADE PLAN REQUEST:",{userId,planId});

    if(!planId){
        return res.status(400).json({
            success:false,
            message:"planId required"
        });
    }

    // update user plan
    db.query(
        "UPDATE tb_users SET plan_id=? WHERE id=?",
        [planId,userId],
        (err,result)=>{

            console.log("UPDATE PLAN ERROR:",err);
            console.log("UPDATE PLAN RESULT:",result);

            if(err){
                return res.status(500).json({
                    success:false
                });
            }

            // get credits of new plan
            db.query(
                "SELECT credits FROM tb_plans WHERE id=?",
                [planId],
                (err2,plan)=>{

                    console.log("PLAN CREDIT ERROR:",err2);
                    console.log("PLAN CREDIT RESULT:",plan);

                    if(err2){
                        return res.status(500).json({
                            success:false
                        });
                    }

                    const credits = plan[0].credits;

                    console.log("NEW PLAN CREDITS:",credits);

                    // update all api keys credits
                    db.query(
                        `UPDATE tb_api_keys 
                         SET credit_limit = ? 
                         WHERE user_id = ?`,
                        [credits,userId],
                        (err3,result3)=>{

                            console.log("API KEY CREDIT UPDATE:",result3);

                            if(err3){
                                return res.status(500).json({
                                    success:false
                                });
                            }

                            res.json({
                                success:true,
                                message:"Plan upgraded successfully",
                                newCredits:credits
                            });

                        }
                    );

                }

            );

        }

    );

};