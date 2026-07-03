import { Resend } from "resend"

// Unset in local/CI environments until a real Resend account is wired up in
// Vercel's env dashboard (PLAN.md Phase 13); email sending no-ops (logged)
// rather than throwing, so signup/password-reset flows keep working without it.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_ADDRESS = "Perfmate <noreply@perfmate.app>"

type TEmailCopy = {
  subject: string
  heading: string
  body: string
  cta: string
  expiry: string
}

const PASSWORD_RESET_COPY: Record<"en" | "ja", TEmailCopy> = {
  en: {
    subject: "Reset your Perfmate password",
    heading: "Reset your password",
    body: "We received a request to reset your Perfmate password. Click the button below to choose a new one.",
    cta: "Reset password",
    expiry: "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
  },
  ja: {
    subject: "Perfmateのパスワードをリセット",
    heading: "パスワードのリセット",
    body: "Perfmateのパスワードリセットのリクエストを受け付けました。下のボタンから新しいパスワードを設定してください。",
    cta: "パスワードをリセット",
    expiry: "このリンクは1時間で有効期限が切れます。心当たりがない場合は、このメールを無視してください。",
  },
}

const EMAIL_VERIFICATION_COPY: Record<"en" | "ja", TEmailCopy> = {
  en: {
    subject: "Verify your Perfmate email address",
    heading: "Verify your email address",
    body: "Click the button below to verify your email address and finish setting up your Perfmate account.",
    cta: "Verify email",
    expiry: "This link expires in 24 hours.",
  },
  ja: {
    subject: "Perfmateのメールアドレスを確認",
    heading: "メールアドレスの確認",
    body: "下のボタンからメールアドレスを確認し、Perfmateアカウントの設定を完了してください。",
    cta: "メールアドレスを確認",
    expiry: "このリンクは24時間で有効期限が切れます。",
  },
}

const renderEmail = (copy: TEmailCopy, actionUrl: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h1 style="font-size: 20px;">${copy.heading}</h1>
    <p>${copy.body}</p>
    <p>
      <a href="${actionUrl}" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
        ${copy.cta}
      </a>
    </p>
    <p style="color: #666; font-size: 13px;">${copy.expiry}</p>
  </div>
`

const send = async (to: string, copy: TEmailCopy, actionUrl: string) => {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping send of "${copy.subject}" to ${to} (link: ${actionUrl})`)
    return
  }
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: copy.subject,
    html: renderEmail(copy, actionUrl),
  })
}

// `locale` comes from next-intl's request locale, typed as a broader `string`
// there — fall back to English for any locale this app doesn't ship copy for.
const resolveCopy = <T extends TEmailCopy>(copies: Record<"en" | "ja", T>, locale: string) =>
  copies[locale as "en" | "ja"] ?? copies.en

export const sendPasswordResetEmail = (to: string, resetUrl: string, locale: string) =>
  send(to, resolveCopy(PASSWORD_RESET_COPY, locale), resetUrl)

export const sendVerificationEmail = (to: string, verifyUrl: string, locale: string) =>
  send(to, resolveCopy(EMAIL_VERIFICATION_COPY, locale), verifyUrl)
