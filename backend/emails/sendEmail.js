const { Resend } = require("resend");

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
};

/**
 * Central email sending function
 * @param {string} recipientEmail
 * @param {string} subject
 * @param {string} htmlTemplate
 * @param {string} textFallback
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmail = async (recipientEmail, subject, htmlTemplate, textFallback = "") => {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.error("RESEND_API_KEY not configured");
      return {
        success: false,
        error: "Email service not configured"
      };
    }

    if (!recipientEmail || !subject) {
      console.error("Missing required email parameters");
      return {
        success: false,
        error: "Invalid email parameters"
      };
    }

    console.log(`Sending email to: ${recipientEmail}`);

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: recipientEmail,
      subject,
      html: htmlTemplate,
      text: textFallback || subject
    });

    if (response.error) {
      console.error("Email send failed:", response.error);
      return {
        success: false,
        error: response.error.message
      };
    }

    console.log(`Email sent successfully. Message ID: ${response.data.id}`);

    return {
      success: true,
      messageId: response.data.id
    };
  } catch (error) {
    console.error("Error sending email:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { sendEmail };
