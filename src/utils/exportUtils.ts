import { jsPDF } from 'jspdf';
import { Message } from '../types';

export const exportToPDF = async (title: string, messages: Message[]) => {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, margin, y);
  y += 20;

  messages.forEach((msg) => {
    // Role
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(msg.role === 'user' ? 100 : 50, 50, 200);
    doc.text(msg.role === 'user' ? 'Vous' : 'Nemo', margin, y);
    y += 7;

    // Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    const lines = doc.splitTextToSize(msg.content, contentWidth);
    
    // Check if we need a new page
    if (y + lines.length * 5 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(lines, margin, y);
    y += lines.length * 5 + 10;

    // Images (if any) - simplified for now as base64 images can be large
    if (msg.images && msg.images.length > 0) {
      msg.images.forEach((img) => {
        if (y + 60 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        try {
          doc.addImage(img, 'PNG', margin, y, 60, 60);
          y += 70;
        } catch (e) {
          console.error("Error adding image to PDF:", e);
        }
      });
    }
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToTXT = (title: string, messages: Message[]) => {
  let content = `${title}\n`;
  content += `Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;
  content += `==========================================\n\n`;

  messages.forEach((msg) => {
    content += `${msg.role === 'user' ? 'VOUS' : 'NEMO'} (${msg.timestamp.toLocaleString('fr-FR')}):\n`;
    content += `${msg.content}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
