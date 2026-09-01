import { Resend } from "resend";
import logger from "./logger.js";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey || !emailFrom) {
    return null;
  }

  return new Resend(apiKey);
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

  const resend = getResendClient();

  if (!resend) {
    logger.warn(
      "Resend email configuration missing. OTP was not sent via email; logging it instead.",
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

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject,
    html: `
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

        <p>If you did not request this code, you can safely ignore this email.</p>

        <hr />

        <p style="color: #777;">
          InnerVoice
        </p>
      </div>
    `,
  });

  if (error) {
    logger.error("Email sending error: " + error.message);
    throw new Error("Failed to send OTP email");
  }

  return data;
};
