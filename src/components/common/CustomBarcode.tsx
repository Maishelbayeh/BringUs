import React, { useRef } from 'react';
import Barcode from 'react-barcode';

interface CustomBarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  margin?: number;
  displayValue?: boolean;
  format?: 'CODE128' | 'CODE39' | 'CODE128A' | 'CODE128B' | 'CODE128C' | 'EAN13' | 'EAN8' | 'EAN5' | 'EAN2' | 'UPC' | 'UPCE' | 'ITF14' | 'ITF' | 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110' | 'pharmacode' | 'codabar' | 'GenericBarcode';
  className?: string;
  style?: React.CSSProperties;
  showPrintButton?: boolean;
  printButtonText?: string;
  printButtonClassName?: string;
  isRTL?: boolean;
}

const CustomBarcode: React.FC<CustomBarcodeProps> = ({
  value,
  width = 2,
  height = 100,
  fontSize = 20,
  margin = 10,
  displayValue = true,
  format = 'CODE128',
  className = '',
  style = {},
  showPrintButton = false,
  // printButtonText,
  // printButtonClassName = '',
  isRTL = false
}) => {
  const barcodeRef = useRef<HTMLDivElement>(null);

  // Don't render if no value is provided
  if (!value || value.trim() === '') {
    return null;
  }

    // دالة طباعة الباركود
  const handlePrint = () => {
    if (!barcodeRef.current) return;

    try {
      // تحويل الباركود إلى صورة باستخدام html2canvas
      const barcodeElement = barcodeRef.current.querySelector('svg');
      if (!barcodeElement) {
        alert(isRTL ? 'لا يمكن تحويل الباركود إلى صورة' : 'Cannot convert barcode to image');
        return;
      }

      // إنشاء canvas وتحويل SVG إلى صورة
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(barcodeElement);
      const img = new Image();
      
      // إضافة معالج الأخطاء للصورة
      img.onerror = () => {
        alert(isRTL ? 'خطأ في تحويل الباركود إلى صورة' : 'Error converting barcode to image');
      };
      
      img.onload = () => {
        try {
          // تعيين أبعاد canvas
          canvas.width = img.width + 20; // إضافة padding
          canvas.height = img.height + 20;
          
          // رسم خلفية بيضاء
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // رسم الباركود
            ctx.drawImage(img, 10, 10);
          }
          
          // تحويل canvas إلى base64
          const imageData = canvas.toDataURL('image/png');
          
          // إنشاء نافذة الطباعة
          const printWindow = window.open('', '_blank', 'width=800,height=600');
          if (!printWindow) {
            alert(isRTL ? 'يرجى السماح بالنوافذ المنبثقة للطباعة' : 'Please allow popups for printing');
            return;
          }

          // محتوى صفحة الطباعة - بحجم الباركود فقط
          const printContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${isRTL ? 'طباعة الباركود' : 'Print Barcode'}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                  }
                  .barcode-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: ${canvas.width}px;
                    height: ${canvas.height}px;
                    background: white;
                  }
                  .barcode-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                  }
                  @media print {
                    body { 
                      margin: 0; 
                      padding: 0;
                      background: white;
                      width: ${canvas.width}px;
                      height: ${canvas.height}px;
                      overflow: hidden;
                    }
                    .barcode-container { 
                      width: 100%;
                      height: 100%;
                      margin: 0;
                      padding: 0;
                    }
                    .barcode-image {
                      width: 100%;
                      height: 100%;
                      object-fit: contain;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="barcode-container">
                  <img src="${imageData}" alt="Barcode" class="barcode-image" onload="setTimeout(() => { window.print(); window.close(); }, 200);" />
                </div>
              </body>
            </html>
          `;

          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // تنظيف الذاكرة
          URL.revokeObjectURL(url);
          
        } catch (error) {
          console.error('Error in print process:', error);
          alert(isRTL ? 'خطأ في عملية الطباعة' : 'Error in print process');
        }
      };
      
      // تحويل SVG إلى data URL
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
      
    } catch (error) {
      console.error('Error in handlePrint:', error);
      alert(isRTL ? 'خطأ في عملية الطباعة' : 'Error in print process');
    }
  };

  return (
    <div className={`custom-barcode-container ${className}`} style={style}>
      <div 
        ref={barcodeRef}
        className="relative group"
        style={{ cursor: 'pointer' }}
        onClick={showPrintButton ? handlePrint : undefined}
        title={showPrintButton ? (isRTL ? 'انقر لطباعة الباركود' : 'Click to print barcode') : ''}
      >
        <Barcode
          value={value}
          width={width}
          height={height}
          fontSize={fontSize}
          margin={margin}
          displayValue={displayValue}
          format={format}
        />
        
        {/* Overlay للطباعة عند hover */}
        {showPrintButton && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              borderRadius: '4px'
            }}
          >
            <div className="text-white text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-1">
                <polyline points="6,9 6,2 18,2 18,9"></polyline>
                <path d="M6,18H4a2,2 0 0,1-2-2V11a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18"></path>
                <polyline points="6,14 6,18 18,18 18,14"></polyline>
              </svg>
              <div className="text-xs font-medium">
                {isRTL ? 'طباعة' : 'Print'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default CustomBarcode; 