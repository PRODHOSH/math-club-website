'use client';
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle, XCircle, AlertCircle, Loader2, QrCode, Camera } from 'lucide-react';

interface ScanResult {
  type: 'success' | 'already' | 'rejected' | 'error';
  name?: string;
  reg_no?: string;
  session?: number;
  message?: string;
}

interface Props {
  eventId: number;
  eventTitle: string;
  activeSession: number;
  onClose: () => void;
}

export default function ScannerModal({ eventId, eventTitle, activeSession, onClose }: Props) {
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState('');
  const attCol = `att_${activeSession}_at` as 'att_1_at' | 'att_2_at' | 'att_3_at';

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      try { html5QrRef.current.clear(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const processQr = async (rawText: string) => {
    setProcessing(true);

    let token = rawText;
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.token) token = parsed.token;
    } catch {}

    // Look up registration
    const { data: reg, error } = await supabase
      .from('registrations')
      .select('id, name, reg_no, event_id, att_1_at, att_2_at, att_3_at')
      .eq('qr_token', token)
      .maybeSingle();

    if (error || !reg) {
      setResult({ type: 'rejected', message: 'Not in the registration list for this event.' });
      setProcessing(false);
      return;
    }

    if (String(reg.event_id) !== String(eventId)) {
      setResult({ type: 'rejected', message: 'QR is for a different event.' });
      setProcessing(false);
      return;
    }

    // Check if already marked for this session
    if (reg[attCol]) {
      const time = new Date(reg[attCol] as string).toLocaleTimeString();
      setResult({ type: 'already', name: reg.name, reg_no: reg.reg_no, session: activeSession,
        message: `Already marked at ${time}` });
      setProcessing(false);
      return;
    }

    // Mark attendance
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ [attCol]: new Date().toISOString() })
      .eq('id', reg.id);

    if (updateError) {
      setResult({ type: 'error', message: updateError.message });
    } else {
      setResult({ type: 'success', name: reg.name, reg_no: reg.reg_no, session: activeSession });
    }
    setProcessing(false);
  };

  const startScanner = async () => {
    if (!scannerDivRef.current) return;
    setCameraError('');
    setResult(null);
    setScanning(true);

    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('core-qr-reader');
    html5QrRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText: string) => {
          await stopScanner();
          await processQr(decodedText);
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setCameraError('Could not access camera. Allow camera permission and try again.');
    }
  };

  const handleNext = async () => {
    setResult(null);
    await startScanner();
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <div>
            <p className="text-white font-semibold">QR Scanner — Session {activeSession}</p>
            <p className="text-[#7d8590] text-xs mt-0.5 truncate max-w-[240px]">{eventTitle}</p>
          </div>
          <button onClick={handleClose} className="text-[#7d8590] hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Camera view */}
          <div className={`rounded-xl overflow-hidden bg-[#010409] ${scanning ? 'block' : 'hidden'}`}>
            <div id="core-qr-reader" ref={scannerDivRef} className="w-full" />
          </div>

          {/* Idle state */}
          {!scanning && !result && !processing && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-20 h-20 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                <QrCode size={40} className="text-[#30363d]" />
              </div>
              {cameraError && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {cameraError}
                </p>
              )}
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin text-blue-400" />
              <span className="text-white font-medium">Checking...</span>
            </div>
          )}

          {/* Result */}
          {result && !processing && (
            <div className={`rounded-xl p-5 border ${
              result.type === 'success' ? 'bg-green-950/40 border-green-500/30' :
              result.type === 'already' ? 'bg-yellow-950/40 border-yellow-500/30' :
              result.type === 'rejected' ? 'bg-red-950/40 border-red-500/30' :
              'bg-red-950/40 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {result.type === 'success' && <CheckCircle size={28} className="text-green-400 flex-shrink-0" />}
                {result.type === 'already' && <AlertCircle size={28} className="text-yellow-400 flex-shrink-0" />}
                {(result.type === 'rejected' || result.type === 'error') && <XCircle size={28} className="text-red-400 flex-shrink-0" />}
                <div>
                  <p className={`font-bold text-lg leading-tight ${
                    result.type === 'success' ? 'text-green-400' :
                    result.type === 'already' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.type === 'success' && `✓ Checked In — Session ${result.session}`}
                    {result.type === 'already' && `Already Marked — Session ${result.session}`}
                    {result.type === 'rejected' && 'Not Registered'}
                    {result.type === 'error' && 'Error'}
                  </p>
                  {result.message && result.type !== 'success' && (
                    <p className="text-sm text-[#7d8590] mt-0.5">{result.message}</p>
                  )}
                </div>
              </div>
              {(result.name || result.reg_no) && (
                <div className="bg-black/20 rounded-lg p-3 space-y-1">
                  {result.name && <p className="text-white font-medium">{result.name}</p>}
                  {result.reg_no && <p className="text-[#7d8590] font-mono text-sm">{result.reg_no}</p>}
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          {!processing && (
            <button
              onClick={result ? handleNext : startScanner}
              disabled={scanning}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 ${
                result ? 'bg-[#21262d] hover:bg-[#30363d] text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Camera size={16} />
              {result ? 'Scan Next Person' : 'Open Camera'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
