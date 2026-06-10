const cron = require('node-cron');
const db = require("../config/prisma");
const { sendEventReminder } = require('../services/bookingEmailService');


const initializeReminderCron = () => {
  console.log('⏰ Initializing event reminder cron job...');

  cron.schedule('0 * * * *', async () => {
    console.log(`\n📅 Running event reminder cron job at ${new Date().toISOString()}`);

    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingRegistrations = await db.registrations.findMany({
        where: {
          reminder_sent: false,
          statusi: { in: ['pending', 'confirmed', 'completed'] },
          Events: {
            data_fillimit: {
              gt: now,
              lt: twentyFourHoursFromNow,
            },
          },
        },
        include: {
          Users: true,
          Events: true,
        },
        orderBy: {
          Events: {
            data_fillimit: 'asc',
          },
        },
      });

      if (upcomingRegistrations.length === 0) {
        console.log('✅ No upcoming events to remind about');
        return;
      }

      console.log(`📧 Found ${upcomingRegistrations.length} upcoming registrations to remind`);

      for (const reg of upcomingRegistrations) {
        try {
          const reminderData = {
            userName: reg.Users?.emri,
            userEmail: reg.Users?.email,
            eventName: reg.Events?.titulli,
            eventDate: reg.Events?.data_fillimit ? new Date(reg.Events.data_fillimit).toLocaleString() : '',
            eventLocation: reg.Events?.lokacioni,
          };

          if (!reminderData.userEmail) {
            console.error(`❌ Skipped registration ${reg.id}: User email address is missing.`);
            continue;
          }

          const emailResult = await sendEventReminder(reminderData);

          if (emailResult.success) {
            // Update the registration record tracking state atomically using Prisma
            await db.registrations.update({
              where: { id: reg.id },
              data: { reminder_sent: true },
            });
            console.log(`✅ Reminder marked as sent for registration ${reg.id}`);
          }
        } catch (error) {
          console.error(`❌ Error sending reminder for registration ${reg.id}:`, error.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(`✅ Cron job completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('❌ Error in reminder cron job:', error.message);
    }
  });

  console.log('✅ Event reminder cron job initialized');
};

module.exports = { initializeReminderCron };
