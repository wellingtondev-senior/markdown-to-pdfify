
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

export async function generatePDF(element: HTMLElement): Promise<string> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling'],
  });
  
  const scale = 2;
  const padding = 60;
  
  const dataUrl = await htmlToImage.toPng(element, {
    width: element.scrollWidth * scale,
    height: element.scrollHeight * scale,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: `${element.scrollWidth}px`,
      height: `${element.scrollHeight}px`,
      padding: `${padding}px`,
    },
    pixelRatio: 2
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const availableWidth = pageWidth - (padding * 2);
  
  const img = new Image();
  img.src = dataUrl;
  
  return new Promise<string>((resolve, reject) => {
    img.onload = () => {
      try {
        const imgWidth = img.width / scale;
        const imgHeight = img.height / scale;
        const ratio = imgWidth / imgHeight;
        
        const finalWidth = availableWidth;
        const finalHeight = finalWidth / ratio;
        
        let heightLeft = finalHeight;
        let position = 0;
        
        pdf.addImage(dataUrl, 'PNG', padding, padding, finalWidth, finalHeight);
        heightLeft -= (pageHeight - (padding * 2));
        position = 1;
        
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(
            dataUrl, 
            'PNG', 
            padding, 
            padding - (position * (pageHeight - (padding * 2))), 
            finalWidth, 
            finalHeight
          );
          heightLeft -= (pageHeight - (padding * 2));
          position++;
        }
        
        pdf.save('mdpdf-download.pdf');
        resolve('PDF generated successfully');
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for PDF generation'));
    };
  });
}
