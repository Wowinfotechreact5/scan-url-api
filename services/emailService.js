const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true only for 465
    auth: {
        user: "wowinfotechdeveloper@gmail.com",
        pass: "jwla fzsp xapw uvff"
    }
});
exports.sendVerificationEmail = async (email, token) => {

    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
    await transporter.sendMail({
            from: `"Auth System" <${process.env.SMTP_USER}>`,
       
        to: email,
        subject: "Verify your account",
        html: `
            <h3>Email Verification</h3>
            <p>Please click below to activate your account</p>
            <a href="${verifyLink}">Activate Account</a>
        `
    });

};