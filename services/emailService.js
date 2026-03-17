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

    // const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
    // const verifyLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;
    const verifyLink = `https://api.scan-url.wowinfosolutions.com/api/auth/verify-email?token=${token}`;

    console.log("Verification Link:", verifyLink);

  await transporter.sendMail({
        from: `"ScanURL" <no-reply@scanurl.ai>`,
        to: email,
        subject: "Verify Your Account - ScanURL",
        html: `
        <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
            <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                    <td style="background:#0d6efd;padding:20px;text-align:center;">
                        <h2 style="color:#ffffff;margin:0;">ScanURL</h2>
                        <p style="color:#dbeafe;margin:5px 0 0;">Secure API Platform</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:30px;">
                        <h3 style="margin-top:0;color:#333;">Verify Your Email</h3>
                        <p style="color:#555;font-size:14px;">
                            Thank you for registering with <strong>ScanURL</strong>.
                            Please confirm your email address to activate your account.
                        </p>

                        <div style="text-align:center;margin:30px 0;">
                            <a href="${verifyLink}" 
                               style="background:#0d6efd;color:#ffffff;padding:12px 25px;
                               text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;">
                               Verify Account
                            </a>
                        </div>

                        <p style="font-size:13px;color:#777;">
                            If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="word-break:break-all;font-size:12px;color:#0d6efd;">
                            ${verifyLink}
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#f1f5f9;padding:15px;text-align:center;font-size:12px;color:#888;">
                        © ${new Date().getFullYear()} ScanURL. All rights reserved.
                    </td>
                </tr>

            </table>
        </div>
        `
    });

};

exports.sendResetPasswordEmail = async (email, token) => {

    const resetLink = `${process.env.Admin_BASE_URL}/reset-password?token=${token}`;

     await transporter.sendMail({
        from: `"ScanURL" <no-reply@scanurl.ai>`,
        to: email,
        subject: "Reset Your Password - ScanURL",
        html: `
        <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
            <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                    <td style="background:#dc3545;padding:20px;text-align:center;">
                        <h2 style="color:#ffffff;margin:0;">ScanURL</h2>
                        <p style="color:#ffe4e6;margin:5px 0 0;">Password Recovery</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:30px;">
                        <h3 style="margin-top:0;color:#333;">Reset Your Password</h3>
                        <p style="color:#555;font-size:14px;">
                            We received a request to reset your password. Click the button below to set a new password.
                        </p>

                        <div style="text-align:center;margin:30px 0;">
                            <a href="${resetLink}" 
                               style="background:#dc3545;color:#ffffff;padding:12px 25px;
                               text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;">
                               Reset Password
                            </a>
                        </div>

                        <p style="font-size:13px;color:#777;">
                            If you did not request this, you can safely ignore this email.
                        </p>

                        <p style="word-break:break-all;font-size:12px;color:#dc3545;">
                            ${resetLink}
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#f1f5f9;padding:15px;text-align:center;font-size:12px;color:#888;">
                        © ${new Date().getFullYear()} ScanURL. All rights reserved.
                    </td>
                </tr>

            </table>
        </div>
        `
    });

};