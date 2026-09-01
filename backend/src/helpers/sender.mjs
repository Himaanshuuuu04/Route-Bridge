import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "../.env" });

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_HOSTINGER_USER,
        pass: process.env.EMAIL_HOSTINGER_PASSWORD,
    },
});

export async function sendMail(email, name, otp) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_HOSTINGER_USER,
            to: email,
            subject: `OTP is ${otp} - EvoGlobalInsight`,
            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:16px;overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="
background:linear-gradient(135deg,#0f172a,#1e293b);
padding:40px 30px;
text-align:center;
">
<h1 style="
margin:0;
color:#ffffff;
font-size:30px;
font-weight:700;
letter-spacing:0.5px;
">
Evo Global Insight
</h1>

<p style="
margin-top:10px;
color:#cbd5e1;
font-size:14px;
">
Secure Dashboard Access
</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px 35px;">

<h2 style="
margin:0 0 20px 0;
color:#0f172a;
font-size:24px;
">
Verify Your Sign-In
</h2>

<p style="
font-size:16px;
line-height:1.7;
color:#475569;
margin-bottom:25px;
">
Hello <strong>${name}</strong>,
</p>

<p style="
font-size:16px;
line-height:1.7;
color:#475569;
margin-bottom:30px;
">
We received a request to sign in to your
<strong>Evo Global Insight Dashboard</strong>.

Use the verification code below to continue:
</p>

<!-- OTP Box -->
<div style="
background:#f8fafc;
border:2px dashed #2563eb;
border-radius:12px;
padding:30px;
text-align:center;
margin:30px 0;
">

<p style="
margin:0 0 10px 0;
font-size:14px;
letter-spacing:1px;
color:#64748b;
text-transform:uppercase;
">
One-Time Password
</p>

<p style="
margin:0;
font-size:42px;
font-weight:700;
letter-spacing:8px;
color:#2563eb;
">
${otp}
</p>

</div>

<p style="
font-size:15px;
color:#64748b;
line-height:1.7;
">
This verification code will expire in
<strong>10 minutes</strong>.
For your security, never share this code with anyone.
</p>

<!-- Security Notice -->
<div style="
background:#eff6ff;
border-left:4px solid #2563eb;
padding:16px;
margin-top:30px;
border-radius:6px;
">

<p style="
margin:0;
font-size:14px;
line-height:1.6;
color:#1e3a8a;
">
If you did not request this login, you can safely ignore this email.
No changes will be made to your account.
</p>

</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="
background:#f8fafc;
padding:25px;
text-align:center;
border-top:1px solid #e2e8f0;
">

<p style="
margin:0;
font-size:14px;
color:#64748b;
">
© ${new Date().getFullYear()} Evo Global Insight
</p>

<p style="
margin-top:8px;
font-size:12px;
color:#94a3b8;
">
This is an automated security email. Please do not reply.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>

            `,
        };
        const info = await transporter.sendMail(mailOptions);
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
                console.error("Authentication failed:", err);
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

export async function sendErrorNotificationMail(workerName, job, err) {
    const adminEmail = process.env.ADMIN_EMAIL || "xdev.himanshu@gmail.com";
    try {
        const mailOptions = {
            from: process.env.EMAIL_HOSTINGER_USER,
            to: adminEmail,
            subject: `🚨 [Alert] Worker Job Failed: ${workerName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #d9534f;">Job Execution Failed in Worker</h2>
                    <p><strong>Worker:</strong> ${workerName}</p>
                    <p><strong>Job ID:</strong> ${job?.id || 'N/A'}</p>
                    <p><strong>Job Name:</strong> ${job?.name || 'N/A'}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <h3>Error Stack / Details:</h3>
                    <pre style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; overflow-x: auto;">${err?.stack || err?.message || err}</pre>
                    <h3>Job Payload:</h3>
                    <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(job?.data || {}, null, 2)}</pre>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Error notification email sent to admin (${adminEmail}) for worker ${workerName}`);
    } catch (notificationErr) {
        console.error("Failed to send error notification email to admin:", notificationErr.message);
    }
}