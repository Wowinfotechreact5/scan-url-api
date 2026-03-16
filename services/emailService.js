const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "a4ec23001@smtp-brevo.com",
        pass: "bskPF8ROS26Kk8w"
    }
});

exports.sendVerificationEmail = async (email, token) => {

    const verifyLink = `${process.env.Admin_BASE_URL}/login?verify-email?token=${token}`;
// https://scan-url-user-dashboard.vercel.app/api/auth/verify-email?token=f190e216-325f-49d3-93c9-b05a3830898f
    await transporter.sendMail({
        from: `"ScanURL" <no-reply@scanurl.ai>`,
        to: email,
        subject: "Verify your account",
        html: `
            <h3>Email Verification</h3>
            <p>Please click below to activate your account</p>
            <a href="${verifyLink}">Activate Account</a>
        `
    });

};


exports.sendResetPasswordEmail = async (email, token) => {

    const resetLink = `${process.env.Admin_BASE_URL}/reset-password?token=${token}`;
log
    await transporter.sendMail({
        from: `"ScanURL" <no-reply@scanurl.ai>`,
        to: email,
        subject: "Reset your password",
        html: `
            <h3>Password Reset</h3>
            <p>Click below to reset your password</p>
            <a href="${resetLink}">Reset Password</a>
        `
    });

};