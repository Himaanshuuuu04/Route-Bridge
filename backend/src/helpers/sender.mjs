import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export async function sendMail(email, name, otp) {
    try {
        const mailOptions = {
            from: `"Survey Platform" <[EMAIL_ADDRESS]>`,
            to: email,
            subject: `OTP is ${otp} for Sign In`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Survey Platform</h2>
                    
                    <p>Hello ${name},</p>
                    
                    <p>Thank you for using our Survey Platform. Below is your One Time Password (OTP) to sign in:</p>
                    
                    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
                        <p style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0;">${otp}</p>
                    </div>
                    
                    <p style="font-size: 12px; color: #7f8c8d;">
                        This OTP will expire in <strong>10 minutes</strong>.
                    </p>
                    
                    <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
                    
                    <p>Best regards,<br>
                    <strong>Survey Platform Team</strong></p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent:", info.messageId);
        if (info.rejected.length > 0) {
            console.warn("Some recipients were rejected:", info.rejected);
        }
    } catch (err) {
        switch (err.code) {
            case "ECONNECTION":
            case "ETIMEDOUT":
                console.error("Network error - retry later:", err.message);
                break;
            case "EAUTH":
                console.error("Authentication failed:", err.message);
                break;
            case "EENVELOPE":
                // err.rejected is only present when every recipient was refused
                console.error("Invalid envelope:", err.message, err.rejected || []);
                break;
            default:
                console.error("Send failed:", err.message);
        }
    }
}