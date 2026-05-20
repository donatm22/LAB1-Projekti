import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Footer
} from '@react-email/components';

export const EventReminder = ({
  userName,
  eventName,
  eventDate,
  eventLocation
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          {/* Header */}
          <Heading style={{ color: '#1f2937', textAlign: 'center', fontSize: '28px', marginBottom: '20px' }}>
            Event Reminder
          </Heading>

          {/* Greeting */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            Hi <strong>{userName}</strong>,
          </Text>

          {/* Reminder Message */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            This is a friendly reminder that your event is coming up very soon! We're excited to see you there.
          </Text>

          {/* Event Details */}
          <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
            <Heading style={{ color: '#1f2937', fontSize: '18px', marginBottom: '15px' }}>
              Event Details
            </Heading>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
              <strong>Event:</strong> {eventName}
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
              <strong>Date & Time:</strong> {eventDate}
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '0' }}>
              <strong>Location:</strong> {eventLocation}
            </Text>
          </div>

          {/* Additional Info */}
          <Text style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Please make sure to:
          </Text>
          <ul style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            <li>Arrive on time</li>
            <li>Bring any necessary documents or tickets</li>
            <li>Have a great experience!</li>
          </ul>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Button
              href={process.env.FRONTEND_URL || 'http://localhost:3000'}
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              View Event Details
            </Button>
          </div>

          {/* Support */}
          <Text style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            If you need to cancel or have any questions, please contact us at <strong>support@eventmanagement.com</strong>.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* Footer */}
          <Footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
            <Text style={{ marginBottom: '5px' }}>
              Event Management Platform
            </Text>
            <Text>
              © 2026 All rights reserved. | <a href={process.env.FRONTEND_URL || 'http://localhost:3000'} style={{ color: '#f59e0b', textDecoration: 'none' }}>Visit our website</a>
            </Text>
          </Footer>
        </Container>
      </Body>
    </Html>
  );
};
