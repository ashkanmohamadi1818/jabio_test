/* Outbound Email (SMTP via Nodemailer) & SMS (Kavenegar / Webhook) code delivery for Jabio.
   When provider credentials are not configured in environment variables, returns a clean preview fallback
   so verification and recovery flows remain testable without leaking secrets. */
const nodemailer = require('nodemailer');

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_HOST.trim());
}

function isSmsConfigured() {
  return Boolean(
    (process.env.SMS_API_KEY && process.env.SMS_API_KEY.trim()) ||
    (process.env.SMS_WEBHOOK_URL && process.env.SMS_WEBHOOK_URL.trim())
  );
}

let cachedTransporter = null;
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const config = {
    host: process.env.SMTP_HOST.trim(),
    port,
    secure
  };
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    config.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }
  cachedTransporter = nodemailer.createTransport(config);
  return cachedTransporter;
}

async function sendEmailCode({ to, code, purpose, lang = 'fa' }) {
  if (!isSmtpConfigured()) {
    return {
      delivered: false,
      configured: false,
      channel: 'email',
      mode: 'preview',
      previewCode: code
    };
  }

  const isReset = purpose === 'reset';
  const subject = isReset
    ? (lang === 'fa' ? 'کد بازیابی رمز عبور جابیو' : 'Your Jabio password reset code')
    : (lang === 'fa' ? 'کد تایید ایمیل جابیو' : 'Verify your Jabio email address');

  const text = isReset
    ? `کد بازیابی رمز عبور حساب جابیو شما: ${code}\nاین کد تا ۱۵ دقیقه معتبر است.\n\nYour Jabio password reset code: ${code} (valid for 15 minutes).`
    : `کد تایید ایمیل حساب جابیو شما: ${code}\nاین کد تا ۱۵ دقیقه معتبر است.\n\nYour Jabio email verification code: ${code} (valid for 15 minutes).`;

  const html = `
    <div style="font-family:Vazirmatn,Segoe UI,Tahoma,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;color:#0f172a">
      <div style="font-size:20px;font-weight:700;margin-bottom:12px">Jabio · جابیو</div>
      <p dir="rtl" style="font-size:14px;line-height:1.8;margin:0 0 16px">${isReset ? 'درخواست بازیابی رمز عبور برای حساب شما ثبت شد. کد زیر را ظرف ۱۵ دقیقه در صفحه بازیابی وارد کنید:' : 'برای تایید آدرس ایمیل حساب جابیو خود، کد زیر را ظرف ۱۵ دقیقه وارد کنید:'}</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:8px;text-align:center;padding:16px;background:#f1f5f9;border-radius:10px;font-family:monospace;color:#0f766e">${code}</div>
      <p style="font-size:12px;color:#64748b;margin-top:16px">Valid for 15 minutes. If you did not request this code, you can safely ignore this message.</p>
    </div>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Jabio <no-reply@jabio.ir>',
      to,
      subject,
      text,
      html
    });
    return { delivered: true, configured: true, channel: 'email', mode: 'smtp' };
  } catch (err) {
    console.error('SMTP delivery error:', err.message);
    return {
      delivered: false,
      configured: true,
      channel: 'email',
      mode: 'smtp_error',
      error: 'delivery_failed'
    };
  }
}

async function sendSmsCode({ to, code, purpose }) {
  if (!isSmsConfigured()) {
    return {
      delivered: false,
      configured: false,
      channel: 'phone',
      mode: 'preview',
      previewCode: code
    };
  }

  const message = purpose === 'reset'
    ? `جابیو - کد بازیابی رمز عبور: ${code} (اعتبار ۱۵ دقیقه)`
    : `جابیو - کد تایید شماره موبایل: ${code} (اعتبار ۱۵ دقیقه)`;

  try {
    if (process.env.SMS_WEBHOOK_URL && process.env.SMS_WEBHOOK_URL.trim()) {
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.SMS_WEBHOOK_TOKEN) {
        headers.Authorization = 'Bearer ' + process.env.SMS_WEBHOOK_TOKEN.trim();
      }
      const res = await fetch(process.env.SMS_WEBHOOK_URL.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, code, purpose, message })
      });
      if (!res.ok) throw new Error('SMS webhook returned ' + res.status);
      return { delivered: true, configured: true, channel: 'phone', mode: 'webhook' };
    }

    // Kavenegar REST API (Iranian standard SMS provider)
    const apiKey = encodeURIComponent(process.env.SMS_API_KEY.trim());
    const localReceptor = to.startsWith('+98') ? '0' + to.slice(3) : to;
    const params = new URLSearchParams({
      receptor: localReceptor,
      message
    });
    if (process.env.SMS_SENDER) params.set('sender', process.env.SMS_SENDER.trim());

    const res = await fetch(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (!res.ok) throw new Error('Kavenegar returned ' + res.status);
    return { delivered: true, configured: true, channel: 'phone', mode: 'kavenegar' };
  } catch (err) {
    console.error('SMS delivery error:', err.message);
    return {
      delivered: false,
      configured: true,
      channel: 'phone',
      mode: 'sms_error',
      error: 'delivery_failed'
    };
  }
}

module.exports = {
  isSmtpConfigured,
  isSmsConfigured,
  sendEmailCode,
  sendSmsCode
};
