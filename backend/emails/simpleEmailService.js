const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_YBJbWp63_Eu2SekHUcvUZNLBBbtjoRAqF');

/**
 * Send a simple email to the current logged-in user
 * @param {string} userEmail - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmailToUser = async (userEmail, subject, html) => {
  try {
    if (!userEmail) {
      return {
        success: false,
        error: 'No recipient email provided'
      };
    }

    console.log(`📧 Sending email to: ${userEmail}`);

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: userEmail,
      subject: subject,
      html: html
    });

    if (response.error) {
      console.error('❌ Email send failed:', response.error);
      return {
        success: false,
        error: response.error.message
      };
    }

    console.log(`✅ Email sent successfully. Message ID: ${response.data.id}`);
    return {
      success: true,
      messageId: response.data.id
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { sendEmailToUser };
