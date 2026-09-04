import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
dotenv.config({ path: "../.env", quiet: true });

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
            subject: `${otp} is your verification code - EvoGlobal Insight`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verification Code</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0f172a;">
  <!-- Preheader preview text -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your one-time verification code is ${otp}. Valid for 10 minutes.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Wrapper Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; width: 100%;">
          
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 19px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">EvoGlobal Insight</span>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 10px -4px rgba(15, 23, 42, 0.02); padding: 36px 32px;">
              
              <!-- Card Header -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Pill Badge -->
                    <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 1px solid #dbeafe; padding: 4px 12px; border-radius: 9999px;">
                          <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px;">
                            Sign-In Verification
                          </span>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.4px;">
                      Verification Code
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 14.5px; color: #64748b; line-height: 1.55;">
                      Hello <strong>${name || 'there'}</strong>, use the verification code below to securely sign in to your EvoGlobal Insight dashboard.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- OTP Display Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 0 0 24px 0; text-align: center;">
                <tr>
                  <td style="padding: 24px 16px;">
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                      One-Time Passcode
                    </div>
                    <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 38px; font-weight: 700; color: #0f172a; letter-spacing: 8px; margin-left: 8px; line-height: 1.1;">
                      ${otp}
                    </div>
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
                        Expires in 10 minutes
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 12.5px; color: #64748b; line-height: 1.55;">
                      <strong style="color: #334155;">Security Note:</strong> If you did not request this code, you can safely ignore this email. Never share this code with anyone; staff will never ask for it.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 28px 16px 0 16px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                © ${new Date().getFullYear()} EvoGlobal Insight. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                Automated security transmission • Do not reply
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