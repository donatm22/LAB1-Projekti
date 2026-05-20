const { sendEmail } = require('../emails/sendEmail');
const { BookingConfirmation } = require('../emails/templates/BookingConfirmation');
const { EventReminder } = require('../emails/templates/EventReminder');
const { BookingCancelled } = require('../emails/templates/BookingCancelled');
const db = require('../../database/db');

/**
 * Send booking confirmation email
 * @param {object} bookingData - Booking information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendBookingConfirmation = async (bookingData) => {
  try {
    const {
      userName,
      userEmail,
      eventName,
      eventDate,
      eventLocation,
      bookingId
    } = bookingData;

    console.log(`📧 Preparing booking confirmation email for: ${userEmail}`);

    const emailContent = BookingConfirmation({
      userName,
      eventName,
      eventDate,
      eventLocation,
      bookingId
    });

    const result = await sendEmail(
      userEmail,
      `Booking Confirmation - ${eventName}`,
      emailContent,
      `Booking confirmed for ${eventName} on ${eventDate}`
    );

    if (result.success) {
      console.log(`✅ Booking confirmation email sent successfully`);
    } else {
      console.error(`❌ Failed to send booking confirmation:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in sendBookingConfirmation:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send event reminder email
 * @param {object} reminderData - Reminder information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEventReminder = async (reminderData) => {
  try {
    const {
      userName,
      userEmail,
      eventName,
      eventDate,
      eventLocation
    } = reminderData;

    console.log(`📧 Preparing event reminder email for: ${userEmail}`);

    const emailContent = EventReminder({
      userName,
      eventName,
      eventDate,
      eventLocation
    });

    const result = await sendEmail(
      userEmail,
      `Event Reminder - ${eventName}`,
      emailContent,
      `Reminder: Your event ${eventName} is tomorrow!`
    );

    if (result.success) {
      console.log(`✅ Event reminder email sent successfully`);
    } else {
      console.error(`❌ Failed to send event reminder:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in sendEventReminder:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send booking cancellation email
 * @param {object} cancellationData - Cancellation information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendBookingCancellation = async (cancellationData) => {
  try {
    const {
      userName,
      userEmail,
      eventName
    } = cancellationData;

    console.log(`📧 Preparing booking cancellation email for: ${userEmail}`);

    const emailContent = BookingCancelled({
      userName,
      eventName
    });

    const result = await sendEmail(
      userEmail,
      `Booking Cancelled - ${eventName}`,
      emailContent,
      `Your booking for ${eventName} has been cancelled`
    );

    if (result.success) {
      console.log(`✅ Booking cancellation email sent successfully`);
    } else {
      console.error(`❌ Failed to send booking cancellation:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in sendBookingCancellation:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendEventReminder
};
