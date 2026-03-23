const db = require("../db");

exports.getPlans = (callback) => {
    db.query("SELECT * FROM tb_plans", callback);
};

exports.getUserPlan = (userId, callback) => {
    db.query(
        `SELECT p.name,p.credits
         FROM tb_users u
         JOIN tb_plans p ON u.plan_id = p.id
         WHERE u.id=?`,
        [userId],
        callback
    );
};

exports.upgradePlan = (userId, planId, callback) => {
    db.query(
        `UPDATE tb_users SET plan_id=? WHERE id=?`,
        [planId, userId],
        callback
    );
};

exports.allocateCredits = (userId, credits, callback) => {

    db.query(
        `UPDATE tb_api_keys 
         SET credit_limit = credit_limit + ? 
         WHERE user_id=?`,
        [credits, userId],
        callback
    );

};