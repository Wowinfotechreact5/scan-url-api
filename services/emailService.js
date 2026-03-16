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

    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

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