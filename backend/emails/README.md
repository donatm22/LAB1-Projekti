# Email Management System - Implementation Guide

This document provides a complete overview of the Event Management Platform's production-ready email system using Resend.

## Overview

The email system is fully integrated with the backend and provides:

✅ **Booking Confirmation Emails** - Sent immediately after registration  
✅ **Event Reminder Emails** - Sent 24 hours before event starts  
✅ **Booking Cancellation Emails** - Sent when registration is cancelled  
✅ **Automated Cron Job** - Runs every hour to send reminders  
✅ **Fire-and-Forget Pattern** - Non-blocking email sends  

---

## Architecture

### Directory Structure

```
backend/
├── emails/
│   ├── templates/
│   │   ├── BookingConfirmation.jsx
│   │   ├── EventReminder.jsx
│   │   └── BookingCancelled.jsx
│   └── sendEmail.js
│
├── services/
│   └── bookingEmailService.js
│
├── cron/
│   └── reminderCron.js
│
├── migrations/
│   └── 001_add_reminder_sent_column.js
│
├── scripts/
│   └── setup-email.js
│
└── .env (configuration)
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| **sendEmail.js** | Central email sender with Resend integration |
| **bookingEmailService.js** | High-level email business logic |
| **Templates** | React Email responsive HTML templates |
| **reminderCron.js** | Automated reminder job runner |
| **registrationController.js** | Integration with booking endpoints |

---

## Installation

### 1. Install Dependencies

All dependencies are already configured in `package.json`:

```bash
npm install
```

This includes:
- `resend` - Email provider
- `@react-email/components` - Template components
- `react` & `react-dom` - Required for templates
- `node-cron` - Scheduler for reminders
- `uuid` - ID generation

### 2. Configure Environment Variables

Create or update `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=your_api_key_here
EMAIL_FROM=no-reply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Database (existing)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_management
DB_USER=postgres
DB_PASSWORD=your_password

# Server
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret
```

### 3. Get Resend API Key

1. Visit [https://resend.com](https://resend.com)
2. Create an account
3. Generate API key from dashboard
4. For development, use: `onboarding@resend.dev`
5. For production, verify your domain and update `EMAIL_FROM`

### 4. Run Database Migration

Add the `reminder_sent` column to Registrations:

```bash
# Option 1: Using setup script
node scripts/setup-email.js

# Option 2: Manual SQL
ALTER TABLE "Registrations" ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
```

### 5. Start the Server

```bash
npm run dev
```

The reminder cron job will start automatically with the server.

---

## How It Works

### Booking Flow

```
1. User creates registration (POST /registrations)
   ↓
2. Registration saved to database
   ↓
3. API returns success immediately
   ↓
4. Confirmation email sent asynchronously (background)
```

### Email Confirmation Process

```javascript
// User books ticket
POST /registrations
{
  "event_id": 1,
  "user_id": 5,
  "ticket_id": 10
}

// Response (immediate)
{
  "message": "Regjistrimi u krye me sukses",
  "registration": { id: 42, ... }
}

// Email sent in background (doesn't block response)
```

### Reminder Process

```
Every Hour:
├─ Query registrations with upcoming events (next 24h)
├─ Filter those with reminder_sent = false
├─ Send reminder email for each
└─ Update reminder_sent = true
```

---

## API Integration

### 1. Create Registration (Booking)

**Endpoint:** `POST /registrations`

When a registration is created, a confirmation email is sent automatically:

```javascript
// controllers/registrationController.js
const createRegistration = (req, res) => {
  // 1. Save registration to DB
  // 2. Return success immediately
  // 3. Send email asynchronously
  
  db.query(sql, [event_id, user_id, ticket_id], (err, result) => {
    // Return success
    res.status(201).json({ registration });
    
    // Send email (fire-and-forget)
    sendBookingConfirmation(bookingData).catch(err => {
      console.error('Email error:', err);
    });
  });
};
```

**What happens:**
- ✅ Registration saved
- ✅ API returns immediately
- ✅ Email queued to Resend
- ✅ Email sends in background

### 2. Delete Registration (Cancellation)

**Endpoint:** `DELETE /registrations/:id`

When a registration is cancelled, a cancellation email is sent:

```javascript
// controllers/registrationController.js
const deleteRegistration = (req, res) => {
  // 1. Delete registration
  // 2. Return success immediately
  // 3. Send cancellation email asynchronously
  
  db.query('DELETE FROM "Registrations" WHERE id = $1', [id], (err) => {
    res.json({ message: "Regjistrimi u fshi me sukses" });
    
    // Send cancellation email
    sendBookingCancellation(cancellationData).catch(err => {
      console.error('Email error:', err);
    });
  });
};
```

---

## Service Functions

### Send Booking Confirmation

```javascript
const { sendBookingConfirmation } = require('../services/bookingEmailService');

await sendBookingConfirmation({
  userName: 'Filan Fisteku',
  userEmail: 'filan@example.com',
  eventName: 'Sunny Hill Festival',
  eventDate: '21 June 2026, 14:00',
  eventLocation: 'Berrnice',
  bookingId: 42
});
```

### Send Event Reminder

```javascript
const { sendEventReminder } = require('../services/bookingEmailService');

await sendEventReminder({
  userName: 'Filan Fisteku',
  userEmail: 'filan@example.com',
  eventName: 'Sunny Hill Festival',
  eventDate: '21 June 2026, 14:00',
  eventLocation: 'Berrnice'
});
```

### Send Cancellation Email

```javascript
const { sendBookingCancellation } = require('../services/bookingEmailService');

await sendBookingCancellation({
  userName: 'Filan Fisteku',
  userEmail: 'filan@example.com',
  eventName: 'Sunny Hill Festival'
});
```

---

## Email Templates

### BookingConfirmation.jsx

**When sent:** Immediately after registration
**Props:**
- `userName` - User's name
- `userEmail` - User's email
- `eventName` - Event name
- `eventDate` - Event date/time
- `eventLocation` - Event venue
- `bookingId` - Unique booking ID

**Content:**
- Confirmation headline
- Event details box
- View booking button
- Support contact info

### EventReminder.jsx

**When sent:** 24 hours before event
**Props:**
- `userName` - User's name
- `userEmail` - User's email
- `eventName` - Event name
- `eventDate` - Event date/time
- `eventLocation` - Event venue

**Content:**
- Reminder headline
- Event details (highlighted)
- Pre-event checklist
- View event button
- Support contact info

### BookingCancelled.jsx

**When sent:** When registration is deleted
**Props:**
- `userName` - User's name
- `userEmail` - User's email
- `eventName` - Event name

**Content:**
- Cancellation headline
- Event details (muted)
- Refund information
- Support contact info

---

## Cron Job Details

### Configuration

File: `backend/cron/reminderCron.js`

```javascript
// Runs at 0 minutes of every hour
cron.schedule('0 * * * *', async () => {
  // Send reminders for events in next 24 hours
});
```

### Query Logic

Finds registrations where:
- Event starts in next 24 hours
- `reminder_sent = false`
- Status is `pending`, `confirmed`, or `completed`

### Process

1. **Query** - Find eligible registrations
2. **Loop** - Iterate through each registration
3. **Send** - Send reminder email
4. **Update** - Set `reminder_sent = true`
5. **Delay** - 500ms between emails (rate limiting)
6. **Log** - Track execution and success

### Monitoring

Check logs for cron execution:

```bash
# Start in dev mode to see logs
npm run dev

# Look for output like:
# ⏰ Running event reminder cron job at 2026-05-20T14:00:00Z
# 📧 Found 3 upcoming registrations to remind
# ✅ Reminder marked as sent for registration 42
```

---

## Error Handling

### Email Failures Don't Break Registrations

```javascript
// Even if email fails, booking is saved and API returns success
sendBookingConfirmation(data).catch(error => {
  // Error logged but doesn't prevent booking
  console.error('Email error:', error);
  // User still gets their booking
});
```

### Logging

All email operations are logged:

```
✅ Email sent successfully. Message ID: xyz123
❌ Email send failed: Invalid API key
📧 Preparing booking confirmation email for: user@example.com
⏰ Running event reminder cron job at 2026-05-20T14:00:00Z
```

### Recovery

If email sending fails:
- User's registration still exists
- API still functions normally
- Error is logged to console
- Resend automatically retries

---

## Testing

### Test with Development Email

For testing before production setup:

```env
RESEND_API_KEY=<test_key>
EMAIL_FROM=onboarding@resend.dev
```

This allows sending to any email address without domain verification.

### Manual Testing

```bash
# Start server
npm run dev

# Create a registration (should send confirmation email)
curl -X POST http://localhost:5000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "user_id": 5,
    "ticket_id": 10
  }'

# Delete a registration (should send cancellation email)
curl -X DELETE http://localhost:5000/registrations/42
```

### Email Logs

Check backend console for email operation logs:

```
📧 Sending email to: user@example.com
✅ Email sent successfully. Message ID: msg_xyz123
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `RESEND_API_KEY` to production key
- [ ] Verify domain in Resend dashboard
- [ ] Update `EMAIL_FROM` with verified domain
- [ ] Set `EMAIL_FROM` to no-reply address
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Test all email templates on production server
- [ ] Monitor cron job execution logs
- [ ] Set up error alerting for email failures
- [ ] Enable backup email if primary fails

---

## Future Enhancements

The system is designed for easy extension:

### Planned Features

1. **Email Queue System** - BullMQ integration
2. **Redis Support** - For distributed reminders
3. **Email Analytics** - Open/click tracking
4. **Multi-Language** - Internationalized templates
5. **SMS Reminders** - Text message fallback
6. **Admin Dashboard** - Email log viewer
7. **A/B Testing** - Template variants
8. **Webhook Support** - Real-time email events

### How to Add Features

All email services follow the same pattern:

```javascript
// Add new email in services/bookingEmailService.js
const sendNewEmail = async (data) => {
  const emailContent = NewTemplate(data);
  return await sendEmail(
    data.userEmail,
    'Subject',
    emailContent,
    'fallback text'
  );
};

// Integrate in controller
controller.js
  sendNewEmail(data).catch(err => console.error(err));
```

---

## Troubleshooting

### Emails Not Sending

**Problem:** No emails received
**Solution:**
1. Check `RESEND_API_KEY` is set
2. Check `EMAIL_FROM` matches verified domain
3. Check user email is correct
4. Check logs for error messages
5. Test with `onboarding@resend.dev` in development

### Cron Job Not Running

**Problem:** Reminders not sent at scheduled time
**Solution:**
1. Check server is running (`npm run dev`)
2. Check node-cron is installed
3. Verify `reminder_sent` column exists
4. Check logs for cron execution messages
5. Restart server

### Missing Column

**Problem:** "Column reminder_sent does not exist"
**Solution:**
1. Run setup script: `node scripts/setup-email.js`
2. Or manually run migration:
   ```sql
   ALTER TABLE "Registrations" 
   ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
   ```

### API Key Rejected

**Problem:** "Invalid API key" error
**Solution:**
1. Generate new key from Resend dashboard
2. Update `RESEND_API_KEY` in .env
3. Restart server
4. Test again

---

## References

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email
- **Node Cron:** https://github.com/kelektiv/node-cron
- **Express Async:** https://expressjs.com/en/advanced/best-practice-error-handling.html

---

## Support

For issues or questions:

1. Check logs: `npm run dev`
2. Verify configuration: `.env` file
3. Test API: `curl` commands above
4. Review this documentation

---

**Last Updated:** May 20, 2026  
**Version:** 1.0 - Production Ready
