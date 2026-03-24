const db = require("../db");

exports.getWallet = (userId, callback) => {

db.query(
"CALL sp_get_wallet(?)",
[userId],
callback
);

};