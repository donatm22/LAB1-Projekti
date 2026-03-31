const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');

async function buildPDF(dataCallback, endCallback, ticket) {
    // ticket includes { ticketId, eventName, eventDate, eventTime, venue, attendeeName }

    const TICKET_SECRET = process.env.TICKET_SECRET;

    // string representation i ticket ID & issue date
    const data = JSON.stringify({ ticketId: ticket.ticketId, issuedAt: Date.now() });
    
    // HMAC signtiure fitohet prej (data + ticket secret key) per me evitu ticket forgery
    const sig = crypto.createHmac('sha256', TICKET_SECRET)
                      .update(data)
                      .digest('hex');

    const payload = JSON.stringify({ data, sig });

    // final QR i fitum prej (data + SHA256(data+secret key))
    const qrBuffer = await QRCode.toBuffer(payload);


    // krijo dokument me size 600x250
    const doc = new PDFDocument({ size: [600, 250], margin: 0 });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    const W = doc.page.width;
    const H = doc.page.height;

    // Background gradient
    const bg = doc.linearGradient(0, 0, W, 0);
bg.stop(0,    '#2d00f7')
  .stop(0.35, '#6a00f4')
  .stop(0.65, '#d4a017')
  .stop(1,    '#ffcc00');
    doc.rect(0, 0, W, H).fill(bg);

    // diagonal stripe overlay
    doc.save();
    doc.opacity(0.09);
    for (let x = -H; x < W + H; x += 18) {
        doc.moveTo(x, 0).lineTo(x + H, H).stroke('#ffffff');
    }
    doc.restore();

    // Left section divider line
    const dividerX = 420;
    doc.save()
       .moveTo(dividerX, 20)
       .lineTo(dividerX, H - 20)
       .lineWidth(1)
       .dash(4, { space: 4 })
       .stroke('#ffffff')
       .restore();

    // Left section: event info
    const leftPad = 30;

    // Event name
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(ticket.eventName, leftPad, 28, { width: 360 });

    // Divider line under event name
    doc.moveTo(leftPad, 62)
       .lineTo(dividerX - 20, 62)
       .lineWidth(1)
       .opacity(0.3)
       .stroke('#ffffff')
       .opacity(1);

    // Info rows
    const infoY = 75;
    const lineH = 30;

    const rows = [
        { label: 'Attendee: ', value: ticket.attendeeName },
        { label: 'Date: ',     value: ticket.eventDate },
        { label: 'Time: ',     value: ticket.eventTime },
        { label: 'Venue: ',    value: ticket.venue },
    ];

    rows.forEach((row, i) => {
        const y = infoY + i * lineH;

        doc.fontSize(10)
   .font('Helvetica-Bold')
   .fillColor('#ffffff')
   // Combine them into one string
   .text(`${row.label} ${row.value}`, leftPad, y, {
       width: dividerX - leftPad,
       lineBreak: false,
       ellipsis: true
   });
    });

    // Ticket ID tag at bottom left
    doc.roundedRect(leftPad, H - 45, 200, 22, 4)
       .fillOpacity(0.25)
       .fill('#ffffff');

    doc.fillOpacity(1)
       .fontSize(9)
       .font('Helvetica')
       .fillColor('#1a1a2e')
       .text(`Ticket ID: ${ticket.ticketId}`, leftPad + 8, H - 40);

    // Right section: QR code
    const qrX = dividerX + 15;
    const qrSize = 140;
    const qrY = (H - qrSize) / 2;

    // White card behind QR
    doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8)
       .fillOpacity(0.85)
       .fill('#ffffff');

    doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

    // Scan label under QR
    doc.fillOpacity(1)
       .fontSize(8)
       .font('Helvetica')
       .fillColor('#1a1a2e')
       .text('Scan at entry', qrX - 8, qrY + qrSize + 10, {
           width: qrSize + 16,
           align: 'center'
       });

    doc.end();
}

module.exports = { buildPDF };