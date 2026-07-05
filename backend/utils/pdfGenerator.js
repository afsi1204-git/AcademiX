const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate certificate PDF
 */
exports.generateCertificate = async (
  studentName,
  courseName,
  issuedDate,
  certificateId
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        orientation: 'landscape',
      });

      const filename = `certificate_${certificateId}.pdf`;
      const filepath = path.join(
        process.env.CERTIFICATE_UPLOAD_DIR || './uploads/certificates',
        filename
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Add background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f0f0');

      // Add border
      doc
        .lineWidth(3)
        .strokeColor('#1a1a1a')
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke();

      // Add title
      doc
        .fontSize(40)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('CERTIFICATE OF COMPLETION', {
          align: 'center',
          y: 100,
        });

      // Add decorative line
      doc
        .lineWidth(2)
        .strokeColor('#4CAF50')
        .moveTo(150, 160)
        .lineTo(doc.page.width - 150, 160)
        .stroke();

      // Add text
      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#333333')
        .text('This is to certify that', {
          align: 'center',
          y: 200,
        });

      // Student name
      doc
        .fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#4CAF50')
        .text(studentName, {
          align: 'center',
          y: 260,
        });

      // Course completion text
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#333333')
        .text('has successfully completed the course', {
          align: 'center',
          y: 320,
        });

      // Course name
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text(courseName, {
          align: 'center',
          y: 360,
        });

      // Date and ID
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Date: ${issuedDate}`, 50, 480)
        .text(`Certificate ID: ${certificateId}`, doc.page.width - 250, 480);

      // Footer
      doc
        .fontSize(10)
        .fillColor('#999999')
        .text(
          'This certificate is issued in recognition of successful course completion.',
          50,
          doc.page.height - 80,
          {
            align: 'center',
          }
        );

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate report PDF
 */
exports.generateReport = async (reportData, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `report_${reportType}_${Date.now()}.pdf`;
      const filepath = path.join(
        process.env.REPORT_UPLOAD_DIR || './uploads/reports',
        filename
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add title
      doc.fontSize(20).font('Helvetica-Bold').text(reportData.title || 'Report', {
        align: 'center',
        margin: 20,
      });

      // Add content
      Object.entries(reportData).forEach(([key, value]) => {
        if (key !== 'title') {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, {
              margin: 10,
            });

          doc.fontSize(11).font('Helvetica').text(String(value), {
            margin: 10,
          });
        }
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
};
