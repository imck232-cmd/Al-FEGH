
import React, { useState } from 'react';
import { Copy, FileText, FileDown, Check, MessageCircle } from 'lucide-react';

interface ExportButtonsProps {
  content: string;
  responseRef: React.RefObject<HTMLDivElement>;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ content, responseRef }) => {
  const [copied, setCopied] = useState(false);
  const { jsPDF } = (window as any).jspdf;

  const cleanContent = (text: string) => {
    return text
      .replace(/\[START_SHORT_ANSWER\]/g, '')
      .replace(/\[END_SHORT_ANSWER\]/g, '')
      .replace(/\[START_DETAILED_ANSWER\]/g, '')
      .replace(/\[END_DETAILED_ANSWER\]/g, '')
      .trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent(content)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    if (!content) return;

    const disclaimer = `⚠️ *تنبيه مهم إخلاء للمسؤولية* ⚠️\n\n1️⃣ الإجابات قد تكون غير دقيقة في بعض الأوقات ولذا يرجى التأكد وعدم الاعتماد الكلي على البرنامج.\n2️⃣ البرنامج للعلم فقط ولا يصح الاعتماد عليه في الفتوى أو الأخذ به كفتوى بل تؤخذ الفتوى من العلماء لا من المواقع والبرامج.\n\n━━━━━━━━━━━━━━━\n\n`;
    const footer = `\n\n━━━━━━━━━━━━━━━\n✨ *منقول من برنامج رفيقك في الأسئلة والاستفسارات الفقهية، نرجو منكم دعوة خاصة صادقة* ✨`;
    
    // Clean and format content for WhatsApp
    const textToShare = cleanContent(content);
    const lines = textToShare.split('\n');
    const formattedLines: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Handle Tables (convert to school: ruling format)
      if (line.startsWith('|')) {
        if (line.includes('---|') || line.includes(':---|')) {
          continue; // Skip separator line
        }
        
        const rowData = line.split('|').map(d => d.trim()).filter(d => d !== '');
        // Check if it's a header row or data row
        if (rowData.length >= 2) {
          if (!inTable) {
            inTable = true;
            formattedLines.push(`\n📋 *خلاصة الأحكام:*`);
          }
          // Skip the header row if it contains "المذهب"
          if (rowData[0].includes('المذهب')) continue;
          
          formattedLines.push(`📍 *${rowData[0]}*: ${rowData[1]}`);
        }
        continue;
      } else {
        if (inTable) {
          inTable = false;
          formattedLines.push(''); 
        }
      }

      // Handle Headings with Emojis
      if (line.startsWith('###')) {
        const title = line.replace('###', '').trim();
        let emoji = '💠';
        if (title.includes('المقدمة')) emoji = '📚';
        if (title.includes('نصوص')) emoji = '📖';
        if (title.includes('خلاصة')) emoji = '⚖️';
        if (title.includes('الأدلة')) emoji = '🛡️';
        if (title.includes('التفصيل')) emoji = '🖋️';
        if (title.includes('الخاتمة')) emoji = '🏁';
        formattedLines.push(`\n${emoji} *${title}*`);
      } else if (line.startsWith('##')) {
        formattedLines.push(`\n🔸 *${line.replace('##', '').trim()}*`);
      } else if (line.startsWith('#')) {
        formattedLines.push(`\n👑 *${line.replace('#', '').trim()}*`);
      } else if (line.startsWith('>')) {
        // Blockquotes (Verses/Hadiths)
        formattedLines.push(`_“${line.replace('>', '').trim()}”_`);
      } else if (line.startsWith('-')) {
        formattedLines.push(`• ${line.replace('-', '').trim()}`);
      } else if (line.match(/^\d+\./)) {
        formattedLines.push(`✅ ${line}`);
      } else if (line !== '') {
        // Regular text with bold conversion
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '*$1*');
        formattedLines.push(formattedLine);
      } else {
        formattedLines.push('');
      }
    }

    const fullMessage = disclaimer + formattedLines.join('\n') + footer;
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    
    const win = window.open(whatsappUrl, '_blank');
    if (win) {
      win.focus();
    } else {
      window.location.href = whatsappUrl;
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([cleanContent(content)], { type: 'text/plain;charset=utf-8' });
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


  const buttonClass = "flex items-center gap-1.5 p-1.5 rounded-md bg-gray-700 hover:bg-teal-600 transition-colors shadow-md text-xs";

  return (
    <div className="flex flex-row gap-1.5">
      <button onClick={handleWhatsAppShare} className={`${buttonClass} bg-green-600 hover:bg-green-500`} title="مشاركة عبر واتساب">
        <MessageCircle size={14} />
        <span className="sr-only">واتساب</span>
      </button>
      <button onClick={handleCopy} className={buttonClass} title="نسخ النص">
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        <span className="sr-only">نسخ النص</span>
      </button>
      <button onClick={handleDownloadTxt} className={buttonClass} title="تحميل كملف نصي">
        <FileText size={14} />
        <span className="sr-only">تحميل كملف نصي</span>
      </button>
      <button onClick={handleDownloadPdf} className={buttonClass} title="تصدير كملف PDF">
        <FileDown size={14} />
        <span className="sr-only">تصدير كملف PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
