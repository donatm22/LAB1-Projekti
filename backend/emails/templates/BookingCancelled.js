function BookingCancelled({
  userName,
  eventName
}) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px;">
        
        <h1 style="color: #1f2937; text-align: center; font-size: 28px; margin-bottom: 20px;">
          Booking Cancelled
        </h1>

        <p style="color: #374151; font-size: 16px;">
          Hi <strong>${userName || "Guest"}</strong>,
        </p>

        <p style="color: #374151; font-size: 16px;">
          Your booking for <strong>${eventName || "the event"}</strong> has been cancelled.
        </p>

        <p style="color: #6b7280; font-size: 14px;">
          If this was a mistake, please contact support.
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

module.exports = BookingCancelled;