import nodemailer from "nodemailer";
import { Resend } from "resend";
import dns from "node:dns";
import logger from "./logger.js";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const getEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    return null;
  }

  const port = parseInt(process.env.EMAIL_PORT || "465", 10);
  const isSecure = port === 465;

  const ipv4Lookup = (hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;
    dns.lookup(hostname, { family: 4 }, cb);
  };

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: isSecure,
    lookup: ipv4Lookup,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      servername: process.env.EMAIL_HOST || "smtp.gmail.com",
      rejectUnauthorized: true,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
};

export const sendOTPEmail = async (email, otp, purpose = "signup") => {
  const subject =
    purpose === "signup"
      ? "Your InnerVoice Signup OTP"
      : "Your InnerVoice Password Reset OTP";

  const heading =
    purpose === "signup"
      ? "Verify your InnerVoice account"
      : "Reset your InnerVoice password";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>${heading}</h2>

      <p>Your verification code is:</p>

      <div style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        margin: 25px 0;
      ">
        ${otp}
      </div>

      <p>This OTP will expire in <strong>10 minutes</strong>.</p>

      <p>
        If you did not request this code, you can safely ignore this email.
      </p>

      <hr />

      <p style="color: #777;">
        InnerVoice
      </p>
    </div>
  `;

  // 1. Try Resend if RESEND_API_KEY is configured (HTTP API - 100% reliable on cloud hosts)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail =
        process.env.EMAIL_FROM || "InnerVoice <onboarding@resend.dev>";

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject,
        html: htmlContent,
      });

      if (error) {
        logger.error(`Resend API Error: ${JSON.stringify(error)}`);
        throw new Error(error.message || "Failed to send OTP email via Resend");
      }

      logger.info(`OTP email sent successfully to ${email} via Resend`);
      return data;
    } catch (resendErr) {
      logger.error(`Resend sending error: ${resendErr.message}`);
      throw new Error("Failed to send OTP email");
    }
  }

  // 2. Try Nodemailer (Gmail SMTP Port 465 SSL/TLS)
  const transporter = getEmailTransporter();

  if (!transporter) {
    logger.warn(
      "Email configuration missing. OTP was not sent via email.",
    );

    console.log(`\nOTP for ${email}: ${otp}\n`);

    return {
      mocked: true,
      email,
      otp,
      subject,
      heading,
    };
  }

  try {
    const result = await transporter.sendMail({
      from: `"InnerVoice" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    logger.info(`OTP email sent successfully to ${email} via SMTP`);
    return result;
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`);
    throw new Error("Failed to send OTP email");
  }
};

