const cron = require('node-cron');
const db = require('../../database/db');
const { sendEventReminder } = require('../services/bookingEmailService');

/**
 * Initialize reminder cron job
 * Runs every hour to check for events happening within 24 hours
 * Sends reminders to users who haven't received one yet
 */
const initializeReminderCron = () => {
  console.log('⏰ Initializing event reminder cron job...');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log(`\n📅 Running event reminder cron job at ${new Date().toISOString()}`);

    try {
      // Find all registrations where:
      // 1. Event starts within 24 hours
      // 2. Reminder hasn't been sent yet
      // 3. Booking status is 'completed' or 'confirmed'
      const query = `
        SELECT 
          r.id as registration_id,
          r.user_id,
          r.reminder_sent,
          u.emri as user_name,
          u.email as user_email,
          e.titulli as event_name,
          e.data_fillimit as event_date,
          e.lokacioni as event_location
        FROM "Registrations" r
        JOIN "Users" u ON r.user_id = u.id
        JOIN "Events" e ON r.event_id = e.id
        WHERE 
          r.reminder_sent = false
          AND r.statusi IN ('pending', 'confirmed', 'completed')
          AND e.data_fillimit > NOW()
          AND e.data_fillimit < NOW() + INTERVAL '24 hours'
        ORDER BY e.data_fillimit ASC
      `;

      db.query(query, async (err, results) => {
        if (err) {
          console.error('❌ Error querying registrations for reminders:', err.message);
          return;
        }

        if (results.rows.length === 0) {
          console.log('✅ No upcoming events to remind about');
          return;
        }

        console.log(`📧 Found ${results.rows.length} upcoming registrations to remind`);

        // Send reminder emails
        for (const registration of results.rows) {
          try {
            const reminderData = {
              userName: registration.user_name,
              userEmail: registration.user_email,
              eventName: registration.event_name,
              eventDate: new Date(registration.event_date).toLocaleString(),
              eventLocation: registration.event_location
            };

            const emailResult = await sendEventReminder(reminderData);

            if (emailResult.success) {
              // Mark reminder as sent in database
              db.query(
                'UPDATE "Registrations" SET reminder_sent = true WHERE id = $1',
                [registration.registration_id],
                (updateErr) => {
                  if (updateErr) {
                    console.error(`❌ Failed to update reminder status for registration ${registration.registration_id}:`, updateErr.message);
                  } else {
                    console.log(`✅ Reminder marked as sent for registration ${registration.registration_id}`);
                  }
                }
              );
            }
          } catch (error) {
            console.error(`❌ Error sending reminder for registration ${registration.registration_id}:`, error.message);
          }

          // Small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`✅ Cron job completed at ${new Date().toISOString()}`);
      });
    } catch (error) {
      console.error('❌ Error in reminder cron job:', error.message);
    }
  });

  console.log('✅ Event reminder cron job initialized');
};

module.exports = { initializeReminderCron };
