
import html2canvas from 'html2canvas';

export const exportToJpeg = async (element: HTMLElement, fileName: string) => {
  try {
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${fileName}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
  }
};
