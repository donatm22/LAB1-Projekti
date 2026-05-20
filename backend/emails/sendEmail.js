const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Central email sending function
 * @param {string} recipientEmail - Email address to send to
 * @param {string} subject - Email subject
 * @param {JSX.Element} reactTemplate - React Email template
 * @param {string} textFallback - Plain text fallback
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmail = async (recipientEmail, subject, reactTemplate, textFallback = '') => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    if (!recipientEmail || !subject) {
      console.error('❌ Missing required email parameters');
      return {
        success: false,
        error: 'Invalid email parameters'
      };
    }

    console.log(`📧 Sending email to: ${recipientEmail}`);

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'no-reply@eventmanagement.com',
      to: recipientEmail,
      subject: subject,
      react: reactTemplate,
      text: textFallback || subject
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

module.exports = { sendEmail };
