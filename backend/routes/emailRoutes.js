const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { sendEmailToUser } = require('../emails/simpleEmailService');
const db = require('../../database/db');
const {
  isLettersOnly,
  isValidDateTime,
  isValidPhone,
  toPositiveInteger,
  trimString,
} = require('../utils/validation');

const router = express.Router();

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Test endpoint: Send a welcome email to the current logged-in user
 * GET /email/send-welcome
 * Requires: JWT token in headers
 */
router.get('/send-welcome', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details from database
    db.query(
      'SELECT emri, email FROM "Users" WHERE id = $1',
      [userId],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send welcome email
        const emailResponse = await sendEmailToUser(
          user.email,
          'Welcome to Event Management Platform!',
          `
            <p>Hello <strong>${escapeHtml(user.emri)}</strong>,</p>
            <p>Congrats on joining our <strong>Event Management Platform</strong>!</p>
            <p>You can now:</p>
            <ul>
              <li>Browse and register for events</li>
              <li>Manage your bookings</li>
              <li>Receive event reminders</li>
            </ul>
            <p>Happy event hunting! 🎉</p>
          `
        );

        if (emailResponse.success) {
          res.json({
            message: 'Welcome email sent successfully',
            messageId: emailResponse.messageId,
            sentTo: user.email
          });
        } else {
          res.status(400).json({
            message: 'Failed to send email',
            error: emailResponse.error
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in send-welcome endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test endpoint: Send a booking confirmation email
 * POST /email/send-booking-confirmation
 * Body: { eventName, eventDate, eventLocation }
 * Requires: JWT token in headers
 */
router.post('/send-booking-confirmation', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventName, eventDate, eventLocation } = req.body;

    if (!eventName || !eventDate || !eventLocation) {
      return res.status(400).json({
        message: 'Please provide eventName, eventDate, and eventLocation'
      });
    }

    // Get user details
    db.query(
      'SELECT emri, email FROM "Users" WHERE id = $1',
      [userId],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send confirmation email
        const emailResponse = await sendEmailToUser(
          user.email,
          `Booking Confirmation - ${String(eventName).replace(/[\r\n]/g, ' ')}`,
          `
            <h2>Booking Confirmation</h2>
            <p>Hi <strong>${escapeHtml(user.emri)}</strong>,</p>
            <p>Thank you for booking with us! Your registration has been confirmed.</p>
            
            <h3>Event Details</h3>
            <ul>
              <li><strong>Event:</strong> ${escapeHtml(eventName)}</li>
              <li><strong>Date:</strong> ${escapeHtml(eventDate)}</li>
              <li><strong>Location:</strong> ${escapeHtml(eventLocation)}</li>
            </ul>
            
            <p>We're excited to see you there!</p>
            <p>Regards,<br>Event Management Team</p>
          `
        );

        if (emailResponse.success) {
          res.json({
            message: 'Booking confirmation email sent successfully',
            messageId: emailResponse.messageId,
            sentTo: user.email
          });
        } else {
          res.status(400).json({
            message: 'Failed to send email',
            error: emailResponse.error
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in send-booking-confirmation endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a ticket purchase confirmation email to the current logged-in user
 * POST /email/send-ticket-purchase
 * Body: { ticketCode, eventTitle, eventSpeaker, eventLocation, eventDate, ticketType, ticketSection, ticketQuantity, orderTotal, buyerPhone }
 */
router.post('/send-ticket-purchase', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      ticketCode,
      eventTitle,
      eventSpeaker,
      eventLocation,
      eventDate,
      ticketType,
      ticketSection,
      ticketQuantity,
      orderTotal,
      buyerPhone
    } = req.body;

    if (!ticketCode || !eventTitle || !eventDate || !ticketType || !ticketQuantity || !orderTotal) {
      return res.status(400).json({
        message: 'Please provide ticketCode, eventTitle, eventDate, ticketType, ticketQuantity, and orderTotal'
      });
    }

    const quantityValue = toPositiveInteger(ticketQuantity);
    if (!quantityValue) {
      return res.status(400).json({ message: 'ticketQuantity must be a positive number' });
    }

    if (!isValidDateTime(eventDate) && Number.isNaN(Date.parse(String(eventDate)))) {
      return res.status(400).json({ message: 'eventDate must be a valid date' });
    }

    if (buyerPhone && !isValidPhone(buyerPhone)) {
      return res.status(400).json({ message: 'buyerPhone is not valid' });
    }

    const buyerName = trimString(req.body.buyerName);
    if (buyerName && !isLettersOnly(buyerName)) {
      return res.status(400).json({ message: 'buyerName must contain only letters' });
    }

    db.query(
      'SELECT emri, email FROM "Users" WHERE id = $1',
      [userId],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        const emailResponse = await sendEmailToUser(
          user.email,
          `Ticket Confirmation - ${String(eventTitle).replace(/[\r\n]/g, ' ')}`,
          `
            <h2>Hello World</h2>
            <p>Congrats on sending your <strong>first email</strong> with Resend!</p>
            <p>Hi <strong>${escapeHtml(user.emri)}</strong>, your ticket purchase is confirmed.</p>
            <h3>Ticket details</h3>
            <ul>
              <li><strong>Ticket code:</strong> ${escapeHtml(ticketCode)}</li>
              <li><strong>Event:</strong> ${escapeHtml(eventTitle)}</li>
              <li><strong>Speaker/Artist:</strong> ${escapeHtml(eventSpeaker || 'TBA')}</li>
              <li><strong>Location:</strong> ${escapeHtml(eventLocation || 'TBA')}</li>
              <li><strong>Date:</strong> ${escapeHtml(eventDate)}</li>
              <li><strong>Ticket type:</strong> ${escapeHtml(ticketType)}</li>
              <li><strong>Section:</strong> ${escapeHtml(ticketSection || 'General Admission')}</li>
              <li><strong>Quantity:</strong> ${escapeHtml(quantityValue)}</li>
              <li><strong>Total paid:</strong> ${escapeHtml(orderTotal)}</li>
              <li><strong>Phone:</strong> ${escapeHtml(buyerPhone || 'Not provided')}</li>
            </ul>
            <p>We have sent this confirmation to your logged-in account email: <strong>${escapeHtml(user.email)}</strong>.</p>
          `
        );

        if (emailResponse.success) {
          res.json({
            message: 'Ticket confirmation email sent successfully',
            messageId: emailResponse.messageId,
            sentTo: user.email
          });
        } else {
          res.status(400).json({
            message: 'Failed to send email',
            error: emailResponse.error
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in send-ticket-purchase endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test endpoint: Send a custom email
 * POST /email/send-custom
 * Body: { subject, html }
 * Requires: JWT token in headers
 */
router.post('/send-custom', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({
        message: 'Please provide subject and html'
      });
    }

    // Get user email
    db.query(
      'SELECT email FROM "Users" WHERE id = $1',
      [userId],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const userEmail = result.rows[0].email;

        // Send custom email
        const emailResponse = await sendEmailToUser(userEmail, subject, html);

        if (emailResponse.success) {
          res.json({
            message: 'Email sent successfully',
            messageId: emailResponse.messageId,
            sentTo: userEmail
          });
        } else {
          res.status(400).json({
            message: 'Failed to send email',
            error: emailResponse.error
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in send-custom endpoint:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
