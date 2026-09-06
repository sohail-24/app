import nodemailer from "nodemailer";
import { env } from "../lib/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  skipped?: boolean;
  error?: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter(): nodemailer.Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = env.smtpHost || process.env.SMTP_HOST;
  if (!host) return null;

  const port = env.smtpPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
  const user = env.smtpUser || process.env.SMTP_USER;
  const pass = env.smtpPass || process.env.SMTP_PASS;
  const secure = env.smtpSecure || process.env.SMTP_SECURE === "true" || port === 465;

  const transportOptions: nodemailer.TransportOptions = {
    host,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
  } as unknown as nodemailer.TransportOptions;

  cachedTransporter = nodemailer.createTransport(transportOptions);
  return cachedTransporter;
}

/**
 * Sends a transactional email using configured SMTP or Resend API.
 * Fails gracefully without throwing unhandled exceptions if the provider is unavailable.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const from = options.from || env.smtpFrom || process.env.SMTP_FROM || process.env.EMAIL_FROM || "FreshFlow <orders@freshflow.com>";
  const resendApiKey = env.resendApiKey || process.env.RESEND_API_KEY;
  const smtpTransporter = getSmtpTransporter();

  // 1. Check if SMTP is configured
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`[EmailService] Sent email to ${options.to} via SMTP (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[EmailService] SMTP delivery failed to ${options.to}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 2. Check if Resend API is configured
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[EmailService] Resend API error (${response.status}):`, errText);
        return { success: false, error: `Resend error: ${response.statusText} - ${errText}` };
      }

      const data = (await response.json()) as { id?: string };
      console.log(`[EmailService] Sent email to ${options.to} via Resend (ID: ${data.id})`);
      return { success: true, messageId: data.id };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[EmailService] Resend delivery failed to ${options.to}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 3. No email provider configured
  const notice =
    "[EmailService] Email delivery skipped: No email provider configured (set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY in environment).";
  console.warn(notice);
  return {
    success: false,
    skipped: true,
    error: "No email provider configured. Set SMTP_HOST or RESEND_API_KEY.",
  };
}
