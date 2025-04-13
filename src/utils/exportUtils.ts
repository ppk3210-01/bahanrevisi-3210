
import html2canvas from 'html2canvas';

export const exportToJpeg = async (elementId: string, fileName: string = 'export') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Increase quality
      backgroundColor: '#ffffff',
      logging: false
    });

    const link = document.createElement('a');
    link.download = `${fileName}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    throw error;
  }
};
