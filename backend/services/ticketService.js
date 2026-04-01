const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generateTicketQR(ticketId) {
    const qrValue = `Ticket ID: ${ticketId}`;

    return QRCode.toBuffer(qrValue, {
        type: 'png',
        width: 300,
        margin: 2
    });
}

async function buildPDF(dataCallback, endCallback, ticket) {
    const qrBuffer = await generateTicketQR(ticket.ticketId);

    const doc = new PDFDocument({ size: [600, 250], margin: 0 });

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    const W = doc.page.width;
    const H = doc.page.height;

    const bg = doc.linearGradient(0, 0, W, 0);
bg.stop(0,    '#2d00f7')
  .stop(0.35, '#6a00f4')
  .stop(0.65, '#d4a017')
  .stop(1,    '#ffcc00');
    doc.rect(0, 0, W, H).fill(bg);

    doc.save();
    doc.opacity(0.09);
    for (let x = -H; x < W + H; x += 18) {
        doc.moveTo(x, 0).lineTo(x + H, H).stroke('#ffffff');
    }
    doc.restore();

    const dividerX = 420;
    doc.save()
       .moveTo(dividerX, 20)
       .lineTo(dividerX, H - 20)
       .lineWidth(1)
       .dash(4, { space: 4 })
       .stroke('#ffffff')
       .restore();

    const leftPad = 30;

    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(ticket.eventName, leftPad, 28, { width: 360 });

    doc.moveTo(leftPad, 62)
       .lineTo(dividerX - 20, 62)
       .lineWidth(1)
       .opacity(0.3)
       .stroke('#ffffff')
       .opacity(1);

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
   .text(`${row.label} ${row.value}`, leftPad, y, {
       width: dividerX - leftPad,
       lineBreak: false,
       ellipsis: true
   });
    });

    doc.roundedRect(leftPad, H - 45, 200, 22, 4)
       .fillOpacity(0.25)
       .fill('#ffffff');

    doc.fillOpacity(1)
       .fontSize(9)
       .font('Helvetica')
       .fillColor('#1a1a2e')
       .text(`Ticket ID: ${ticket.ticketId}`, leftPad + 8, H - 40);

    const qrX = dividerX + 15;
    const qrSize = 140;
    const qrY = (H - qrSize) / 2;

    doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8)
       .fillOpacity(0.85)
       .fill('#ffffff');

    doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

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

module.exports = { buildPDF, generateTicketQR };
