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

export const BookingConfirmation = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  bookingId
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          {/* Header */}
          <Heading style={{ color: '#1f2937', textAlign: 'center', fontSize: '28px', marginBottom: '20px' }}>
            Booking Confirmation
          </Heading>

          {/* Greeting */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            Hi <strong>{userName}</strong>,
          </Text>

          {/* Main Message */}
          <Text style={{ color: '#374151', fontSize: '16px', marginBottom: '20px' }}>
            Thank you for booking with us! Your registration has been confirmed.
          </Text>

          {/* Event Details */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
            <Heading style={{ color: '#1f2937', fontSize: '18px', marginBottom: '15px' }}>
              Event Details
            </Heading>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
              <strong>Event:</strong> {eventName}
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
              <strong>Date:</strong> {eventDate}
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
              <strong>Location:</strong> {eventLocation}
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', marginBottom: '0' }}>
              <strong>Booking ID:</strong> {bookingId}
            </Text>
          </div>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Button
              href={`${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/${bookingId}`}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              View Your Booking
            </Button>
          </div>

          {/* Thank You */}
          <Text style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Thank you for choosing us! If you have any questions, please don't hesitate to contact us at <strong>support@eventmanagement.com</strong>.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', marginBottom: '20px' }} />

          {/* Footer */}
          <Footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
            <Text style={{ marginBottom: '5px' }}>
              Event Management Platform
            </Text>
            <Text>
              © 2026 All rights reserved. | <a href={process.env.FRONTEND_URL || 'http://localhost:3000'} style={{ color: '#3b82f6', textDecoration: 'none' }}>Visit our website</a>
            </Text>
          </Footer>
        </Container>
      </Body>
    </Html>
  );
};
