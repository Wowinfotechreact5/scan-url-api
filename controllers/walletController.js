exports.getWallet = (req,res)=>{
const walletModel = require("../models/walletModel");
const userId = req.user.id;

walletModel.getWallet(userId,(err,result)=>{

if(err){
return res.status(500).json({success:false});
}

res.json({
success:true,
data:result[0][0]
});

});

};