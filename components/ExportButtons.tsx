
import React, { useState } from 'react';
import { Copy, FileText, FileDown, Check } from 'lucide-react';

interface ExportButtonsProps {
  content: string;
  responseRef: React.RefObject<HTMLDivElement>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ content, responseRef }) => {
  const [copied, setCopied] = useState(false);
  const { jsPDF } = (window as any).jspdf;

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fiqh_answer.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPdf = () => {
    const input = responseRef.current;
    if (input) {
      (window as any).html2canvas(input, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#1f2937' // Match bg color
      }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save('fiqh_answer.pdf');
      });
    }
  };


  const buttonClass = "flex items-center gap-2 p-2 rounded-md bg-gray-700 hover:bg-teal-600 transition-colors shadow-md";

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handleCopy} className={buttonClass} title="نسخ النص">
        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
        <span className="sr-only">نسخ النص</span>
      </button>
      <button onClick={handleDownloadTxt} className={buttonClass} title="تحميل كملف نصي">
        <FileText size={18} />
        <span className="sr-only">تحميل كملف نصي</span>
      </button>
      <button onClick={handleDownloadPdf} className={buttonClass} title="تصدير كملف PDF">
        <FileDown size={18} />
        <span className="sr-only">تصدير كملف PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
