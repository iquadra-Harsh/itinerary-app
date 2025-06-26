import jsPDF from 'jspdf';
import { type Itinerary } from '@shared/schema';

interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    period: string;
    activity: string;
    location: string;
    duration?: string;
    cost?: string;
    notes?: string;
  }[];
}

interface GeneratedItinerary {
  title: string;
  description: string;
  duration: string;
  days: DayPlan[];
  recommendations: {
    bestPhotoSpots: string[];
    localTips: string[];
    weatherAndPacking: string[];
  };
}

export function exportToPDF(itinerary: Itinerary, generatedContent: GeneratedItinerary) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.5);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title page
  doc.setFillColor(15, 118, 110); // Primary color
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  yPosition = addText(generatedContent.title, margin, 30, pageWidth - 2 * margin, 24, true);
  yPosition = addText(generatedContent.description, margin, yPosition + 10, pageWidth - 2 * margin, 14);
  
  // Trip details
  yPosition = 100;
  doc.setTextColor(0, 0, 0);
  yPosition = addText(`Destination: ${itinerary.location}`, margin, yPosition, pageWidth - 2 * margin, 12, true);
  yPosition = addText(`Duration: ${generatedContent.duration}`, margin, yPosition + 5, pageWidth - 2 * margin, 12);
  yPosition = addText(`Trip Type: ${itinerary.tripType.charAt(0).toUpperCase() + itinerary.tripType.slice(1)}`, margin, yPosition + 5, pageWidth - 2 * margin, 12);
  yPosition = addText(`Transportation: ${itinerary.transport.charAt(0).toUpperCase() + itinerary.transport.slice(1)}`, margin, yPosition + 5, pageWidth - 2 * margin, 12);
  yPosition = addText(`Accommodation: ${itinerary.accommodation.charAt(0).toUpperCase() + itinerary.accommodation.slice(1)}`, margin, yPosition + 5, pageWidth - 2 * margin, 12);
  
  yPosition += 20;

  // Daily itinerary
  generatedContent.days.forEach((day, dayIndex) => {
    checkNewPage(40);
    
    // Day header
    doc.setFillColor(2, 132, 199); // Secondary color
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    yPosition = addText(`Day ${day.day} - ${day.title}`, margin + 5, yPosition + 10, pageWidth - 2 * margin - 10, 16, true);
    yPosition = addText(new Date(day.date).toLocaleDateString(), margin + 5, yPosition + 2, pageWidth - 2 * margin - 10, 12);
    
    yPosition += 15;
    doc.setTextColor(0, 0, 0);

    // Activities
    day.activities.forEach((activity, activityIndex) => {
      checkNewPage(30);
      
      const activityText = `${activity.time} - ${activity.period.charAt(0).toUpperCase() + activity.period.slice(1)}`;
      yPosition = addText(activityText, margin, yPosition, pageWidth - 2 * margin, 12, true);
      yPosition = addText(activity.activity, margin, yPosition + 2, pageWidth - 2 * margin, 11);
      yPosition = addText(`📍 ${activity.location}`, margin, yPosition + 2, pageWidth - 2 * margin, 10);
      
      if (activity.duration || activity.cost) {
        let details = '';
        if (activity.duration) details += `⏱️ ${activity.duration}`;
        if (activity.cost) details += (details ? ' | ' : '') + `💰 ${activity.cost}`;
        yPosition = addText(details, margin, yPosition + 2, pageWidth - 2 * margin, 10);
      }
      
      if (activity.notes) {
        yPosition = addText(`💡 ${activity.notes}`, margin, yPosition + 2, pageWidth - 2 * margin, 10);
      }
      
      yPosition += 8;
    });
    
    yPosition += 10;
  });

  // Recommendations
  checkNewPage(60);
  
  doc.setFillColor(249, 115, 22); // Accent color
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  yPosition = addText('AI Recommendations', margin + 5, yPosition + 8, pageWidth - 2 * margin - 10, 16, true);
  yPosition += 20;
  
  doc.setTextColor(0, 0, 0);

  // Best Photo Spots
  yPosition = addText('📸 Best Photo Spots:', margin, yPosition, pageWidth - 2 * margin, 12, true);
  generatedContent.recommendations.bestPhotoSpots.forEach(spot => {
    yPosition = addText(`• ${spot}`, margin + 10, yPosition + 3, pageWidth - 2 * margin - 10, 10);
  });
  yPosition += 10;

  // Local Tips
  checkNewPage(40);
  yPosition = addText('💡 Local Tips:', margin, yPosition, pageWidth - 2 * margin, 12, true);
  generatedContent.recommendations.localTips.forEach(tip => {
    yPosition = addText(`• ${tip}`, margin + 10, yPosition + 3, pageWidth - 2 * margin - 10, 10);
  });
  yPosition += 10;

  // Weather & Packing
  checkNewPage(40);
  yPosition = addText('🎒 Weather & Packing:', margin, yPosition, pageWidth - 2 * margin, 12, true);
  generatedContent.recommendations.weatherAndPacking.forEach(item => {
    yPosition = addText(`• ${item}`, margin + 10, yPosition + 3, pageWidth - 2 * margin - 10, 10);
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by Wanderlust AI | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${generatedContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
  doc.save(fileName);
}
