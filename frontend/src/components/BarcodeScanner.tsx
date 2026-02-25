import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flashlight, FlashlightOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Declare Quagga as a global variable loaded from CDN
declare global {
  interface Window {
    Quagga: any;
  }
}

export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(true);
  const quaggaLoadedRef = useRef(false);

  // Load Quagga2 from CDN
  useEffect(() => {
    if (quaggaLoadedRef.current || window.Quagga) {
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.12.1/dist/quagga.min.js';
    script.async = true;
    script.onload = () => {
      quaggaLoadedRef.current = true;
      setIsLoading(false);
    };
    script.onerror = () => {
      setError('Failed to load barcode scanner library');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize beep audio
  useEffect(() => {
    beepAudioRef.current = new Audio('/assets/beep.mp3');
    beepAudioRef.current.volume = 0.5;
  }, []);

  // Play beep sound
  const playBeep = () => {
    if (beepAudioRef.current) {
      beepAudioRef.current.currentTime = 0;
      beepAudioRef.current.play().catch((err) => {
        console.warn('Could not play beep sound:', err);
      });
    }
  };

  // Trigger haptic feedback (vibration)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100); // Short vibration (100ms)
    }
  };

  // Toggle flash/torch
  const toggleFlash = async () => {
    if (!videoTrackRef.current) return;

    try {
      const capabilities = videoTrackRef.current.getCapabilities() as any;
      if (capabilities.torch) {
        await videoTrackRef.current.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any],
        });
        setFlashEnabled(!flashEnabled);
      } else {
        toast.error('Flash not supported on this device');
      }
    } catch (err) {
      console.error('Error toggling flash:', err);
      toast.error('Failed to toggle flash');
    }
  };

  // Initialize Quagga scanner
  useEffect(() => {
    if (!isOpen || !scannerRef.current || isLoading || !window.Quagga) return;

    const initScanner = async () => {
      try {
        setError(null);
        setIsInitialized(false);

        await window.Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: scannerRef.current!,
              constraints: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                facingMode: 'environment',
                aspectRatio: { min: 1, max: 2 },
              },
            },
            locator: {
              patchSize: 'medium',
              halfSample: false, // Better quality for blurred barcodes
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                'ean_reader',
                'ean_8_reader',
                'upc_reader',
                'upc_e_reader',
                'code_128_reader',
                'code_39_reader',
              ],
              multiple: false,
            },
            locate: true,
            frequency: 10, // High frequency for low-latency scanning
          },
          (err: any) => {
            if (err) {
              console.error('Quagga initialization error:', err);
              setError(err.message || 'Failed to initialize scanner');
              setIsInitialized(false);
              return;
            }

            // Get video track for flash control
            const videoElement = scannerRef.current?.querySelector('video');
            if (videoElement && videoElement.srcObject) {
              const mediaStream = videoElement.srcObject as MediaStream;
              const videoTracks = mediaStream.getVideoTracks();
              if (videoTracks.length > 0) {
                videoTrackRef.current = videoTracks[0];
              }
            }

            window.Quagga.start();
            setIsInitialized(true);
            setPermissionGranted(true);
            setShowPermissionInfo(false);
          }
        );

        // Handle barcode detection
        window.Quagga.onDetected((result: any) => {
          if (scanCooldown) return;

          const code = result.codeResult.code;
          if (!code) return;

          // Avoid duplicate scans
          if (code === lastScannedCode) return;

          // Play beep sound and trigger haptic feedback
          playBeep();
          triggerHaptic();

          // Visual feedback
          setLastScannedCode(code);
          setTimeout(() => setLastScannedCode(null), 1000);

          // Trigger callback
          onScan(code);

          // Set cooldown to prevent duplicate scans
          setScanCooldown(true);
          setTimeout(() => {
            setScanCooldown(false);
          }, 500);
        });
      } catch (err: any) {
        console.error('Scanner initialization error:', err);
        setError(err.message || 'Failed to start scanner');
        setIsInitialized(false);
      }
    };

    initScanner();

    // Cleanup
    return () => {
      if (videoTrackRef.current && flashEnabled) {
        videoTrackRef.current.applyConstraints({
          advanced: [{ torch: false } as any],
        }).catch(() => {});
      }
      if (window.Quagga) {
        window.Quagga.stop();
        window.Quagga.offDetected();
      }
      videoTrackRef.current = null;
      setIsInitialized(false);
      setFlashEnabled(false);
    };
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (videoTrackRef.current && flashEnabled) {
      videoTrackRef.current.applyConstraints({
        advanced: [{ torch: false } as any],
      }).catch(() => {});
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">Scan Barcode</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Permission Info */}
      {showPermissionInfo && !permissionGranted && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <Alert className="bg-blue-500/90 border-blue-400 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This app uses the camera to provide a high-speed, professional barcode scanning experience for instant billing and inventory management.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Scanner Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading scanner...</p>
          </div>
        ) : (
          <div
            ref={scannerRef}
            className="w-full h-full"
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          />
        )}

        {/* Professional Scanning Overlay */}
        {isInitialized && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning frame with laser line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-4/5 max-w-md aspect-[4/3]">
                {/* Corner frame */}
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  
                  {/* Animated laser line */}
                  <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  </div>
                </div>

                {/* Instruction text */}
                <div className="absolute -bottom-12 left-0 right-0 text-center">
                  <p className="text-white text-sm font-medium drop-shadow-lg">
                    Position barcode within the frame
                  </p>
                </div>
              </div>
            </div>

            {/* Success feedback */}
            {lastScannedCode && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
                  <CheckCircle2 className="h-8 w-8" />
                  <div>
                    <span className="font-bold text-lg">Scanned!</span>
                    <p className="text-sm opacity-90">{lastScannedCode}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-md">
            <Alert variant="destructive" className="bg-red-500/90 border-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Controls */}
      {isInitialized && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={toggleFlash}
              variant="outline"
              size="lg"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm min-w-[140px]"
            >
              {flashEnabled ? (
                <>
                  <FlashlightOff className="h-5 w-5 mr-2" />
                  Flash Off
                </>
              ) : (
                <>
                  <Flashlight className="h-5 w-5 mr-2" />
                  Flash On
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
