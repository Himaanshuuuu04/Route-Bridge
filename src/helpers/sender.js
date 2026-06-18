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

export async function sendMail(email, name) {
    try {
        const info = await transporter.sendMail({
            from: '"Sender Name" <[EMAIL_ADDRESS]>',
            to: email,
            subject: "Hello ✔",
            text: `Hello ${name},`,
            html: `<b>Hello ${name},</b>`,
        });
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