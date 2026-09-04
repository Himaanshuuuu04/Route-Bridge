export function renderSurveyTemplate(status, pid, uid, ipAddress, createdAt) {
    const formattedDate = new Date(createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '/');

    const statusLower = (status || '').toLowerCase().trim();
    
    // Status theme configuration matching dashboard UI
    let statusConfig = {
        badge: 'Complete',
        title: 'Survey Completed',
        subtitle: 'Your response has been verified and recorded.',
        bgLight: '#ecfdf5',
        border: '#a7f3d0',
        color: '#047857',
        iconBg: '#d1fae5',
        iconColor: '#059669',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    };

    if (statusLower.includes('term') && !statusLower.includes('security')) {
        statusConfig = {
            badge: 'Terminate',
            title: 'Survey Terminated',
            subtitle: 'You did not match the criteria required for this survey.',
            bgLight: '#fff1f2',
            border: '#fecdd3',
            color: '#be123c',
            iconBg: '#ffe4e6',
            iconColor: '#e11d48',
            iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
        };
    } else if (statusLower.includes('quota')) {
        statusConfig = {
            badge: 'Quota Full',
            title: 'Quota Reached',
            subtitle: 'The target response quota for this group has been met.',
            bgLight: '#fffbeb',
            border: '#fde68a',
            color: '#b45309',
            iconBg: '#fef3c7',
            iconColor: '#d97706',
            iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        };
    } else if (statusLower.includes('security')) {
        statusConfig = {
            badge: 'Security Term',
            title: 'Verification Filtered',
            subtitle: 'Automated verification check flagged this session.',
            bgLight: '#eef2ff',
            border: '#c7d2fe',
            color: '#4338ca',
            iconBg: '#e0e7ff',
            iconColor: '#4f46e5',
            iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
        };
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Survey Status - EvoGlobalInsight</title>
    <link rel="icon" href="/favicon.ico" />
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

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'CalSans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            background-image: 
                radial-gradient(at 0% 0%, rgba(241, 245, 249, 0.9) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(226, 232, 240, 0.6) 0px, transparent 50%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            width: 100%;
            max-width: 440px;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: cardAppear 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardAppear {
            from {
                opacity: 0;
                transform: translateY(12px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .logo-wrapper {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        }

        .logo-wrapper:hover {
            transform: scale(1.02);
        }

        .brand-logo {
            max-width: 220px;
            height: auto;
            display: block;
            filter: drop-shadow(0 2px 8px rgba(15, 23, 42, 0.04));
        }

        .card {
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.9);
            border-radius: 22px;
            box-shadow: 
                0 20px 30px -10px rgba(15, 23, 42, 0.05),
                0 8px 14px -6px rgba(15, 23, 42, 0.03);
            width: 100%;
            overflow: hidden;
            position: relative;
        }

        .status-header {
            padding: 28px 24px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: ${statusConfig.bgLight};
            color: ${statusConfig.color};
            border: 1px solid ${statusConfig.border};
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${statusConfig.iconColor};
        }

        .status-title {
            font-size: 19px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 4px;
        }

        .status-subtitle {
            font-size: 12.5px;
            color: #64748b;
            font-weight: 500;
            line-height: 1.4;
            max-width: 320px;
        }

        .card-body {
            padding: 20px;
        }

        .details-list {
            background: #f8fafc;
            border: 1px solid #edf2f7;
            border-radius: 14px;
            overflow: hidden;
        }

        .detail-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s ease;
        }

        .detail-item:last-child {
            border-bottom: none;
        }

        .detail-item:hover {
            background: #f1f5f9;
        }

        .detail-left {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .detail-icon {
            width: 30px;
            height: 30px;
            border-radius: 9px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            flex-shrink: 0;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }

        .detail-texts {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .detail-label {
            font-size: 10.5px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .detail-value {
            font-size: 13.5px;
            font-weight: 600;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .font-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            font-weight: 600;
            color: #334155;
            background: #e2e8f0;
            padding: 2px 7px;
            border-radius: 5px;
            letter-spacing: -0.01em;
        }

        .btn-mini-copy {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            margin-left: 8px;
            flex-shrink: 0;
        }

        .btn-mini-copy:hover {
            background: #e2e8f0;
            color: #0f172a;
        }

        .btn-mini-copy.copied {
            color: #10b981;
            background: #ecfdf5;
        }

        .card-actions {
            padding: 0 20px 20px;
        }

        .btn-copy-main {
            background: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            padding: 12px 18px;
            width: 100%;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
        }

        .btn-copy-main:hover {
            background: #1e293b;
            transform: translateY(-1px);
            box-shadow: 0 6px 14px -2px rgba(15, 23, 42, 0.15);
        }

        .btn-copy-main:active {
            transform: translateY(0);
        }

        .btn-copy-main.copied {
            background: #059669;
        }

        .footer {
            margin-top: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .live-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
            0%, 100% {
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            }
            50% {
                box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.05);
            }
        }

        #toast {
            position: fixed;
            bottom: 24px;
            background: #0f172a;
            color: #ffffff;
            padding: 8px 18px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            z-index: 50;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        #toast.show {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-wrapper">
            <img src="/full_logo.webp" alt="EvoGlobalInsight" class="brand-logo" onerror="this.onerror=null; this.src='/logo.webp';">
        </div>

        <div class="card">
            <div class="status-header">
                <div class="status-badge">
                    <span class="status-dot"></span>
                    <span>${statusConfig.badge}</span>
                </div>
                <h1 class="status-title">${statusConfig.title}</h1>
                <p class="status-subtitle">${statusConfig.subtitle}</p>
            </div>

            <div class="card-body">
                <div class="details-list">
                    <div class="detail-item">
                        <div class="detail-left">
                            <div class="detail-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                                </svg>
                            </div>
                            <div class="detail-texts">
                                <span class="detail-label">Project ID</span>
                                <span class="detail-value">${pid}</span>
                            </div>
                        </div>
                        <button class="btn-mini-copy" onclick="copySingle('${pid}', this)" title="Copy Project ID">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                        </button>
                    </div>

                    <div class="detail-item">
                        <div class="detail-left">
                            <div class="detail-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div class="detail-texts">
                                <span class="detail-label">UID / Token</span>
                                <span class="detail-value">${uid}</span>
                            </div>
                        </div>
                        <button class="btn-mini-copy" onclick="copySingle('${uid}', this)" title="Copy UID">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                        </button>
                    </div>

                    <div class="detail-item">
                        <div class="detail-left">
                            <div class="detail-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="2" y1="12" x2="22" y2="12"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                            </div>
                            <div class="detail-texts">
                                <span class="detail-label">IP Address</span>
                                <div><span class="detail-value font-mono">${ipAddress}</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-item">
                        <div class="detail-left">
                            <div class="detail-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div class="detail-texts">
                                <span class="detail-label">Visit Timestamp</span>
                                <span class="detail-value">${formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-actions">
                <button class="btn-copy-main" id="copyAllBtn" onclick="copyAllDetails()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                    <span>Copy Summary</span>
                </button>
            </div>
        </div>

        <div class="footer">
            <span class="live-dot"></span>
            <span>EvoGlobalInsight Verification Receipt</span>
        </div>
    </div>

    <div id="toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span id="toastMsg">Copied to clipboard</span>
    </div>

    <script>
        function triggerToast(text) {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toastMsg');
            toastMsg.innerText = text;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2200);
        }

        function copySingle(text, btnElement) {
            navigator.clipboard.writeText(text).then(() => {
                btnElement.classList.add('copied');
                btnElement.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>\`;
                triggerToast('Copied: ' + text);
                setTimeout(() => {
                    btnElement.classList.remove('copied');
                    btnElement.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>\`;
                }, 1800);
            }).catch(() => {
                triggerToast('Failed to copy');
            });
        }

        function copyAllDetails() {
            const summaryText = [
                'Status: ${statusConfig.badge}',
                'Project ID: ${pid}',
                'UID: ${uid}',
                'IP Address: ${ipAddress}',
                'Timestamp: ${formattedDate}'
            ].join('\\n');

            navigator.clipboard.writeText(summaryText).then(() => {
                const btn = document.getElementById('copyAllBtn');
                const originalHtml = btn.innerHTML;
                
                btn.classList.add('copied');
                btn.innerHTML = \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied to Clipboard!</span>\`;
                triggerToast('Summary copied to clipboard');
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHtml;
                }, 2200);
            }).catch(() => {
                triggerToast('Failed to copy');
            });
        }
    </script>
</body>
</html>`;
}
