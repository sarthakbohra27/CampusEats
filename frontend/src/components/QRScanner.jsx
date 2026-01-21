import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCcw, AlertTriangle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        let isScanned = false;
        
        // Dynamic box size based on container width
        const config = { 
          fps: 15, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.7);
              return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0 
        };

        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          async (decodedText, decodedResult) => {
            if (isScanned) return;
            isScanned = true;
            
            // Stop scanning immediately on success
            if (scannerRef.current) {
              await scannerRef.current.stop().catch(e => console.warn("Failed to stop scanner", e));
            }
            
            onScanSuccess(decodedText, decodedResult);
          },
          (errorMessage) => {
            if (onScanError) onScanError(errorMessage);
          }
        );
        setIsInitializing(false);
      } catch (err) {
        console.error("Camera start error:", err);
        setError("Camera access denied or not found. Please ensure you have granted permission.");
        setIsInitializing(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error("Stop error", e));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black overflow-hidden rounded-2xl border border-white/5">
      {/* Internal Style to force video fit */}
      <style>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem;
        }
        #reader {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
      `}</style>

      {/* Scanner Element */}
      <div id="reader" className="absolute inset-0 z-0"></div>

      {/* Custom Overlay */}
      {!error && !isInitializing && (
        <>
          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
          
          {/* Scanning Box */}
          <div className="relative w-[280px] h-[280px] z-20 pointer-events-none">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
            
            {/* Inner frame */}
            <div className="absolute inset-0 border border-white/20 rounded-xl"></div>
            
            {/* Laser Line */}
            <div className="laser-line"></div>
          </div>
          
          <div className="absolute bottom-12 left-0 right-0 text-center z-30 px-6">
            <span className="bg-slate-900/80 backdrop-blur-xl px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/10 shadow-2xl">
              Align QR Code with frame
            </span>
          </div>
        </>
      )}

      {/* Loading State */}
      {isInitializing && (
        <div className="relative z-40 flex flex-col items-center space-y-4">
          <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initializing Camera...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="relative z-40 p-8 flex flex-col items-center text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle size={32} />
          </div>
          <h4 className="text-lg font-black tracking-tight">Camera Error</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
