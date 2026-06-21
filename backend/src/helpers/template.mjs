export function renderSurveyTemplate(status, pid, uid, ipAddress, createdAt) {
    const formattedDate = new Date(createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '/');

    // Status pill style mapping
    let pillBg = '#03203f'; // Dark navy for Complete as in screen
    let pillColor = '#ffffff';
    
    if (status === 'Terminate') {
        pillBg = '#991b1b'; // Red
        pillColor = '#ffffff';
    } else if (status === 'Quota Full') {
        pillBg = '#92400e'; // Amber
        pillColor = '#ffffff';
    } else if (status === 'Security Term') {
        pillBg = '#3730a3'; // Indigo
        pillColor = '#ffffff';
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Survey End Details - EvoGlobalInsight</title>
    <style>
        @font-face {
            font-family: 'CalSans';
            src: url('/calsans-static-ui/CalSansUI-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: 'CalSans';
            src: url('/calsans-static-ui/CalSansUI-Medium.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'CalSans';
            src: url('/calsans-static-ui/CalSansUI-SemiBold.ttf') format('truetype');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'CalSans';
            src: url('/calsans-static-ui/CalSansUI-Bold.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
        }

        body {
            font-family: 'CalSans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 95vh;
        }

        .logo-container {
            margin-bottom: 24px;
            text-align: center;
        }

        .logo {
            max-width: 320px;
            height: auto;
        }

        .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            width: 100%;
            max-width: 460px;
            padding: 28px;
            box-sizing: border-box;
            border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .card-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            text-align: center;
        }

        .card-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin-bottom: 20px;
        }

        .btn-copy {
            background-color: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 6px;
            color: #475569;
            font-size: 13px;
            font-weight: 600;
            padding: 8px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .btn-copy:hover {
            border-color: #cbd5e1;
            color: #1e293b;
            background-color: #f8fafc;
        }

        .detail-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .detail-row {
            background-color: #f8fafc;
            border-radius: 10px;
            padding: 12px 16px;
            border: 1px solid #f1f5f9;
        }

        .detail-label {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            margin-bottom: 6px;
        }

        .detail-value {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }

        .pill {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        .footer {
            margin-top: 28px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="logo-container">
        <img src="/full_logo.webp" alt="EvoGlobalInsight Logo" class="logo">
    </div>

    <div class="card">
        <div class="card-header">
            <h2 class="card-title">SURVEY END DETAILS</h2>
            <button class="btn-copy" id="copyBtn" onclick="copyDetails()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>COPY</span>
            </button>
        </div>
        <div class="divider"></div>

        <div class="detail-group">
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="pill" style="background-color: ${pillBg}; color: ${pillColor};">${status}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Project ID</div>
                <div class="detail-value">${pid}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">UID</div>
                <div class="detail-value">${uid}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">IP Address</div>
                <div class="detail-value" style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: bold; color: #334155;">${ipAddress}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Visit Time</div>
                <div class="detail-value">${formattedDate}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        EvoGlobalInsight SYSTEM
    </div>

    <script>
        function copyDetails() {
            const detailsText = "Status: ${status}\\nProject ID: ${pid}\\nUID: ${uid}\\nIP Address: ${ipAddress}\\nVisit Time: ${formattedDate}";
            
            navigator.clipboard.writeText(detailsText).then(() => {
                const btn = document.getElementById('copyBtn');
                const btnText = btn.querySelector('span');
                const originalText = btnText.innerText;
                
                btnText.innerText = "COPIED!";
                btn.style.borderColor = "#10b981";
                btn.style.color = "#10b981";
                btn.style.backgroundColor = "#ecfdf5";
                
                setTimeout(() => {
                    btnText.innerText = originalText;
                    btn.style.borderColor = "#e2e8f0";
                    btn.style.color = "#475569";
                    btn.style.backgroundColor = "#ffffff";
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy details: ', err);
            });
        }
    </script>
</body>
</html>
    `;
}
