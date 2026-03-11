const apiKeyModel = require("../models/apiKeyModel");
const crypto = require("crypto");

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

    apiKeyModel.createApiKey(userId,name,apiKey,(err,result)=>{

        if(err){
            return res.status(500).json({
                success:false,
                message:"Database error"
            });
        }

        res.status(201).json({
            success:true,
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

        res.json({
            success:true,
            message:"API key deleted"
        });

    });

};