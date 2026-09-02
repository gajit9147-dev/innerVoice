import nodemailer from "nodemailer";
import logger from "./logger.js";

const getEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: true,
    },
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

  const transporter = getEmailTransporter();

  if (!transporter) {
    logger.warn(
      "Gmail email configuration missing. OTP was not sent via email.",
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

          <p>
            If you did not request this code, you can safely ignore this email.
          </p>

          <hr />

          <p style="color: #777;">
            InnerVoice
          </p>
        </div>
      `,
    });

    logger.info(`OTP email sent successfully to ${email}`);

    return result;
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`);
    throw new Error("Failed to send OTP email");
  }
};
