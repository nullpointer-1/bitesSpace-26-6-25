import { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanQrCode, Camera, CameraOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QRCodeScannerProps {
  onScanSuccess: (orderId: string) => void;
  vendorId: string; // <-- NEW PROP: Add vendorId here
}

const QRCodeScanner = ({ onScanSuccess, vendorId }: QRCodeScannerProps) => { // <-- Destructure vendorId from props
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const updateOrderStatusToCompleted = async (orderId: string) => {
    setIsUpdatingStatus(true);
    try {
      // --- CRITICAL FIXES HERE: Correct URL and Request Body ---
      const response = await fetch(`http://localhost:8081/api/orders/${orderId}/status`, { // <-- CORRECTED URL: orderId as path variable
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed (e.g., "Authorization": "Bearer your_token")
        },
        body: JSON.stringify({
          newStatus: "COMPLETED",
          vendorId: Number(vendorId), // <-- ADDED vendorId to body, convert to Number if backend expects Long
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text(); // Read as text to get raw error message
        console.error('Backend error response:', errorBody);
        throw new Error(`Failed to update order status: ${response.status} ${response.statusText}. Details: ${errorBody.substring(0, 200)}...`);
      }

      const updatedOrder = await response.json(); // This should now succeed if response.ok and backend returns JSON
      console.log('Order marked as COMPLETED:', updatedOrder);
      toast({
        title: "Order Completed",
        description: `Order #${orderId} has been marked as COMPLETED.`,
        variant: "success",
      });

    } catch (error: any) {
      console.error('Error marking order as COMPLETED:', error);
      toast({
        title: "Order Update Failed",
        description: error.message || "Could not mark order as completed. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code scanned:', result.data);
          setLastScannedCode(result.data);
          updateOrderStatusToCompleted(result.data); // Calls the function with scanned ID
          toast({
            title: "QR Code Scanned",
            description: `Order ID: ${result.data}`,
          });
          stopScanning(); // Stop scanning after a successful scan and API call
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanning(true);
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      toast({
        title: "Scanner Error",
        description: "Failed to start camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanQrCode className="h-5 w-5" />
            QR Code Scanner
          </div>
          <Badge variant={isScanning ? "default" : "secondary"}>
            {isScanning ? "Scanning" : "Stopped"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <video
            ref={videoRef}
            className="w-full max-w-sm border rounded-lg"
            style={{ display: isScanning ? 'block' : 'none' }}
          />
          {!isScanning && (
            <div className="w-full max-w-sm h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>Click "Start Scanning" to begin</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex items-center gap-2" disabled={isUpdatingStatus}>
              <Camera className="h-4 w-4" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex items-center gap-2" disabled={isUpdatingStatus}>
              <CameraOff className="h-4 w-4" />
              Stop Scanning
            </Button>
          )}
          {isUpdatingStatus && <p className="text-sm text-blue-600">Updating status...</p>}
        </div>

        {lastScannedCode && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">Last Scanned Order:</p>
            <p className="text-sm text-green-700">{lastScannedCode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
