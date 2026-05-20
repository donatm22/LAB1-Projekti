import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Footer
} from '@react-email/components';

export const BookingCancelled = ({
  userName,
  eventName
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          {/* Header */}
          <Heading style={{ color: '#1f2937', textAlign: 'center', fontSize: '28px', marginBottom: '20px' }}>
            Booking Cancelled
          </Heading>

          {/* Greeting */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            Hi <strong>{userName}</strong>,
          </Text>

          {/* Cancellation Message */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            Your booking for the following event has been successfully cancelled:
          </Text>

          {/* Event Details */}
          <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #ef4444' }}>
            <Heading style={{ color: '#1f2937', fontSize: '18px', marginBottom: '15px' }}>
              Cancelled Event
            </Heading>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '0' }}>
              <strong>Event:</strong> {eventName}
            </Text>
          </div>

          {/* Additional Info */}
          <Text style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Your cancellation has been processed. If you paid for this event, you will receive a refund within 5-7 business days.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* Support */}
          <Text style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            We hope to see you at a future event! If you have any questions about your cancellation, please contact us at <strong>support@eventmanagement.com</strong>.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* Footer */}
          <Footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
            <Text style={{ marginBottom: '5px' }}>
              Event Management Platform
            </Text>
            <Text>
              © 2026 All rights reserved. | <a href={process.env.FRONTEND_URL || 'http://localhost:3000'} style={{ color: '#ef4444', textDecoration: 'none' }}>Visit our website</a>
            </Text>
          </Footer>
        </Container>
      </Body>
    </Html>
  );
};
