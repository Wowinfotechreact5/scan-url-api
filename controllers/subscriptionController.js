const subscriptionModel = require("../models/subscriptionModel");

exports.getPlans = (req,res)=>{

    subscriptionModel.getPlans((err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            data:result
        });

    });

};

exports.getUserPlan = (req,res)=>{

    const userId = req.user.id;

    subscriptionModel.getUserPlan(userId,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            data:result[0]
        });

    });

};

exports.upgradePlan = (req,res)=>{

    const userId = req.user.id;
    const { planId } = req.body;

    subscriptionModel.upgradePlan(userId,planId,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        // get credits of that plan
        subscriptionModel.getUserPlan(userId,(err,plan)=>{

            const credits = plan[0].credits;

            subscriptionModel.allocateCredits(userId,credits,(err2)=>{

                if(err2){
                    return res.status(500).json({success:false});
                }

                res.json({
                    success:true,
                    message:"Plan upgraded successfully"
                });

            });

        });

    });

};