const { Resend } = require("resend");

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
};

/**
 * Send a simple email to the current logged-in user
 * @param {string} userEmail
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmailToUser = async (userEmail, subject, html) => {
  try {
    const resend = getResendClient();

    if (!resend) {
      return {
        success: false,
        error: "Email service not configured"
      };
    }

    if (!userEmail) {
      return {
        success: false,
        error: "No recipient email provided"
      };
    }

    console.log(`Sending email to: ${userEmail}`);

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: userEmail,
      subject,
      html
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

module.exports = { sendEmailToUser };
