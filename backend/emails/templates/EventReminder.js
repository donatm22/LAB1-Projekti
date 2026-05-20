function EventReminder({
  userName,
  eventName,
  eventDate,
  eventLocation
}) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px;">
        
        <h1 style="color: #1f2937; text-align: center; font-size: 28px; margin-bottom: 20px;">
          Event Reminder
        </h1>

        <p style="color: #374151; font-size: 16px;">
          Hi <strong>${userName || "Guest"}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px;">
          This is a reminder for your upcoming event.
        </p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; font-size: 18px;">
            Event Details
          </h2>

          <p><strong>Event:</strong> ${eventName || "N/A"}</p>
          <p><strong>Date:</strong> ${eventDate || "N/A"}</p>
          <p><strong>Location:</strong> ${eventLocation || "N/A"}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          We look forward to seeing you there.
        </p>

        <hr style="border-color: #e5e7eb;" />

        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Event Management Platform</p>
          <p>© 2026 All rights reserved.</p>
        </div>

      </div>
    </div>
  `;
}

module.exports = EventReminder;