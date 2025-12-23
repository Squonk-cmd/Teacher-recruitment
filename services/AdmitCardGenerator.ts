
import { jsPDF } from 'jspdf';
import { Applicant } from '../types';
import { APP_CONFIG } from '../constants';

export const generateAdmitCardPDF = (applicant: Applicant) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Draw Background Image
  if (APP_CONFIG.admitCardBgUrl) {
    try {
      // Background covers the top half of the page
      doc.addImage(APP_CONFIG.admitCardBgUrl, 'JPEG', 0, 0, pageWidth, pageHeight / 2, undefined, 'FAST');
      
      // Add a white semi-transparent overlay to ensure text readability
      doc.setFillColor(255, 255, 255);
      // Native jsPDF transparency is achieved via GState or FillAlpha
      // Simple method: draw a rectangle with lower alpha if supported, 
      // otherwise we use a very light fill color.
      doc.setGState(new (doc as any).GState({ opacity: 0.85 }));
      doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
    } catch (e) {
      console.error("Admit Card Background Error:", e);
    }
  }

  // 2. Draw border for the half-page
  doc.setDrawColor(25, 112, 117);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, pageWidth - 20, (pageHeight / 2) - 15);

  // 3. Title - exactly 40px (~10.6mm) from top margin
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(25, 112, 117);
  doc.text('Teacher Niyog Exam', pageWidth / 2, 20.6, { align: 'center' });

  // 4. Instructions (3 lines)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60);
  const instructions = [
    'Line 1: This admit card is mandatory for entry into the exam hall.',
    'Line 2: Please bring your original National ID card for verification.',
    'Line 3: Reporting time is strictly 30 minutes before the examination.'
  ];
  instructions.forEach((line, i) => {
    doc.text(line, pageWidth / 2, 36 + (i * 6), { align: 'center' });
  });

  // 5. Applicant Info
  doc.setTextColor(20);
  doc.setFontSize(13);
  const labelX = 25;
  const valueX = 75;
  let currentY = 75;
  const stepY = 10;

  const drawRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, valueX, currentY);
    currentY += stepY;
  };

  drawRow('Serial No', applicant.serial.toString().padStart(6, '0'));
  drawRow('Applicant Name', applicant.name.toUpperCase());
  drawRow('Mobile Number', applicant.phone);
  drawRow('Applied For', applicant.applyFor);

  if (applicant.applyFor === 'Assistant Teacher' && applicant.selectedSubject) {
    drawRow('Subject', applicant.selectedSubject);
  }

  // 6. Footer section
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'italic');
  doc.text('This is an electronically generated document valid for the 2024 recruitment session.', pageWidth / 2, (pageHeight / 2) - 25, { align: 'center' });

  // Save the PDF
  doc.save(`AdmitCard_${applicant.serial}_${applicant.name.split(' ')[0]}.pdf`);
};
