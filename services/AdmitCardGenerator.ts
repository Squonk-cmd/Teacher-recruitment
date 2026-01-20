import { jsPDF } from 'jspdf';
import { Applicant } from '../types';
import { APP_CONFIG } from '../constants';

// Change to async function
export const generateAdmitCardPDF = async (applicant: Applicant) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const cardHeight = pageHeight / 2;

  // 1. Background Logic
  if (APP_CONFIG.admitCardBgUrl) {
    try {
      doc.addImage(APP_CONFIG.admitCardBgUrl, 'JPEG', 0, 0, pageWidth, cardHeight, undefined, 'FAST');
      doc.setFillColor(255, 255, 255);
      doc.setGState(new (doc as any).GState({ opacity: 0.30 })); 
      doc.rect(0, 0, pageWidth, cardHeight, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
    } catch (e) { console.error(e); }
  }

  // 2. Add Applicant Photo (The Async way)
  if (applicant.photo) {
    try {
      // We wrap the image loading in a Promise
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // This is required for external URLs
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = url;
        });
      };

      const img = await loadImage(applicant.photo);
      
      const photoWidth = 35;
      const photoHeight = 40;
      const photoX = pageWidth - photoWidth - 15;
      const photoY = 60;

      // Draw photo
      doc.addImage(img, 'JPEG', photoX, photoY, photoWidth, photoHeight, undefined, 'FAST');
      
      // Photo Border
      doc.setDrawColor(25, 112, 117);
      doc.setLineWidth(0.3);
      doc.rect(photoX, photoY, photoWidth, photoHeight);
    } catch (e) {
      console.error("Photo failed to load in PDF:", e);
    }
  }

  // 3. Text & Info (Left Aligned to avoid photo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(25, 112, 117);
  doc.text('TEACHER RECRUITMENT EXAM', pageWidth / 2, 40, { align: 'center' }); 

  doc.setFontSize(9);
  doc.setTextColor(80);
  const instructions = [
    'Admit Card will be available to download on ukacollegiate.school from 21 January 2026.'
  ];
  instructions.forEach((line, i) => doc.text(line, pageWidth / 2, (pageHeight / 2) - 25, { align: 'center' }));

  // Applicant Info
  doc.setTextColor(20);
  doc.setFontSize(12);
  const labelX = 15;
  const valueX = 55;
  let currentY = 65; 

  const drawRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, valueX, currentY);
    currentY += 9;
  };

  drawRow('Serial No', (applicant.id ?? 'N/A').toString());
  drawRow('Applicant Name', (applicant.name || "N/A").toUpperCase());
  drawRow('Mobile Number', applicant.phone || "N/A");
  drawRow('Applied For', applicant.applyFor || "N/A");

  if (applicant.applyFor === 'Assistant Teacher' && applicant.selectedSubject) {
    drawRow('Subject', applicant.selectedSubject);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120);

  doc.save(`AdmitCard_${applicant.serial}_${applicant.name.split(' ')[0]}.pdf`);
};
