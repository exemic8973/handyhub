import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const appName = process.env.APP_NAME ?? 'HandyHub'

  await transporter.sendMail({
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Reset your ${appName} password`,
    text: `You requested a password reset.\n\nClick the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
    `,
  })
}
