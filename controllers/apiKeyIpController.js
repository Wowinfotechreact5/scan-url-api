const apiKeyIpModel = require("../models/apiKeyIpModel");

exports.addIp = (req,res)=>{
 console.log("BODY:",req.body);
    console.log("USER:",req.user);
    const userId = req.user.id;
    const { apiKeyId, ip } = req.body;

    if(!ip){
        return res.status(400).json({
            success:false,
            message:"IP address required"
        });
    }

    apiKeyIpModel.addIp(userId,apiKeyId,ip,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            message:"IP added"
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


exports.deleteIp = (req,res)=>{

    const userId = req.user.id;
    const { id } = req.body;

    apiKeyIpModel.deleteIp(userId,id,(err,result)=>{

        if(err){
            return res.status(500).json({success:false});
        }

        res.json({
            success:true,
            message:"IP removed"
        });

    });

};