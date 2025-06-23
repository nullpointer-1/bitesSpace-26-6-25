
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";

interface QRCodeGeneratorProps {
  orderId: string;
}

const QRCodeGenerator = ({ orderId }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (canvasRef.current) {
        try {
          await QRCode.toCanvas(canvasRef.current, orderId, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [orderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Order QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <canvas ref={canvasRef} className="border rounded-lg" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Show this QR code to the vendor for quick order verification
        </p>
        <p className="text-xs text-gray-500 mt-1">Order ID: {orderId}</p>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;