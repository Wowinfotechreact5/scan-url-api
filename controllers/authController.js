const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const { v4: uuidv4 } = require("uuid");
const emailService = require("../services/emailService");
const db = require("../db");
exports.register = async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ generate verification token
        const token = uuidv4();

        authModel.registerUser(
            name,
            email,
            phone,
            hashedPassword,
            token,
            async (err, result) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                const response = result[0][0];

                if (response.status === 0) {
                    return res.status(409).json({
                        success: false,
                        message: response.message
                    });
                }

           
  const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
console.log("Verification Link:", verifyLink);

// send email
await emailService.sendVerificationEmail(email, token);

res.status(201).json({
    success: true,
    message: "Registration successful. Verification email sent."
});

            }
        );

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password required"
        });
    }

    authModel.getUserByEmail(email, async (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        const response = result[0][0];

        if (response.status === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 🚨 NEW CHECK
        if (response.is_verified === 0) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before login"
            });
        }

        const match = await bcrypt.compare(password, response.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: response.id, email: response.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: response.id,
                name: response.name,
                email: response.email
            }
        });

    });

};


exports.changePassword = async (req, res) => {

    try {

        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields required"
            });
        }

        authModel.getUserByEmail(email, async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

           const user = result[0][0];

if (!user || user.status === 0) {
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}

            const match = await bcrypt.compare(currentPassword, user.password);

            
            if (!match) {
    return res.status(400).json({
        success: false,
        message: "Current password incorrect"
    });
}

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            authModel.updatePassword(email, hashedPassword, (err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Password updated successfully"
                });

            });

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



exports.deleteAccount = (req, res) => {

    try {

        const userId = req.user.id;   // coming from JWT middleware

        authModel.deleteUser(userId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            const response = result[0][0];

            if (response.status === 0) {
                return res.status(404).json({
                    success: false,
                    message: response.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Account deleted successfully"
            });

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
exports.changeEmail = (req, res) => {

    try {

        const userId = req.user.id;
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({
                success: false,
                message: "New email is required"
            });
        }

        authModel.changeEmail(userId, newEmail, (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            const response = result[0][0];

            if (response.status === 0) {
                return res.status(409).json({
                    success: false,
                    message: response.message
                });
            }

            res.status(200).json({
                success: true,
                message: response.message
            });

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


exports.verifyEmail = (req, res) => {

    const { token } = req.query;

    if (!token) {
        return res.redirect("https://scan-url-user-dashboard.vercel.app/login?status=invalid");
    }

    db.query(
        "UPDATE tb_users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?",
        [token],
        (err, result) => {

            if (err) {
                return res.redirect("https://scan-url-user-dashboard.vercel.app/login?status=error");
            }

            if (result.affectedRows === 0) {
                return res.redirect("https://scan-url-user-dashboard.vercel.app/login?status=invalid");
            }

            // success redirect
            res.redirect("https://scan-url-user-dashboard.vercel.app/login?verified=true");

        }
    );
};


exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email required"
            });
        }

        authModel.getUserByEmail(email, async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            const user = result[0][0];

            if (!user || user.status === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const token = uuidv4();

            authModel.saveResetToken(email, token, async (err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                await emailService.sendResetPasswordEmail(email, token);

                res.status(200).json({
                    success: true,
                    message: "Password reset email sent"
                });

            });

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


exports.resetPassword = async (req, res) => {

    try {

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and password required"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        authModel.resetPassword(token, hashedPassword, (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }

            res.status(200).json({
                success: true,
                message: "Password reset successful"
            });

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};