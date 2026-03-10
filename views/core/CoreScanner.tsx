'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, Loader2, QrCode } from 'lucide-react';

interface ScanResult {
  type: 'success' | 'already' | 'error';
  name?: string;
  reg_no?: string;
  message?: string;
}

export default function CoreScanner({ eventId }: { eventId: string }) {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single()
      .then(({ data }) => {
        if (data) setEventTitle(data.title);
      });
  }, [eventId]);

  const processQr = async (rawText: string) => {
    if (processing) return;
    setProcessing(true);

    let token: string = rawText;
    try {
      // QR payload is JSON { token, ts }
      const parsed = JSON.parse(rawText);
      if (parsed.token) token = parsed.token;
    } catch {
      // plain string token fallback
    }

    // Look up registration by token
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .select('id, name, reg_no, event_id')
      .eq('qr_token', token)
      .maybeSingle();

    if (regError || !reg) {
      setResult({ type: 'error', message: 'Invalid QR code — registration not found.' });
      setProcessing(false);
      return;
    }

    if (String(reg.event_id) !== String(eventId)) {
      setResult({ type: 'error', message: 'QR code is for a different event.' });
      setProcessing(false);
      return;
    }

    // Check if already checked in
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('event_id', eventId)
      .eq('qr_token', token)
      .maybeSingle();

    if (existing) {
      setResult({ type: 'already', name: reg.name, reg_no: reg.reg_no });
      setProcessing(false);
      return;
    }

    // Mark attendance
    const { error: insertError } = await supabase
      .from('attendance')
      .insert({
        event_id: parseInt(eventId),
        qr_token: token,
        reg_no: reg.reg_no,
        name: reg.name,
      });

    if (insertError) {
      setResult({ type: 'error', message: `Failed to record attendance: ${insertError.message}` });
    } else {
      setResult({ type: 'success', name: reg.name, reg_no: reg.reg_no });
    }
    setProcessing(false);
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;
    setScanning(true);
    setResult(null);

    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    html5QrRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          await scanner.stop();
          setScanning(false);
          html5QrRef.current = null;
          await processQr(decodedText);
        },
        () => {} // ignore frame errors
      );
    } catch {
      setScanning(false);
      setResult({ type: 'error', message: 'Could not access camera. Please allow camera permission.' });
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try { html5QrRef.current.stop(); } catch {}
      }
    };
  }, []);

  const resetScan = () => {
    setResult(null);
    setProcessing(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => { stopScanner(); router.back(); }}
          className="text-[#7d8590] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">QR Scanner</h1>
          {eventTitle && <p className="text-[#7d8590] text-sm">{eventTitle}</p>}
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Scanner box */}
        <div className="bg-[#161b22] rounded-xl p-4">
          <div
            id="qr-reader"
            ref={scannerRef}
            className={`w-full rounded-lg overflow-hidden ${scanning ? 'min-h-[300px]' : 'hidden'}`}
          />
          {!scanning && (
            <div className="flex flex-col items-center py-10 gap-4">
              <QrCode size={64} className="text-[#30363d]" />
              <p className="text-[#7d8590] text-sm text-center">
                Position the student&apos;s QR code in front of your camera
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        {!scanning && !result && (
          <button
            onClick={startScanner}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            <QrCode size={18} />
            Start Scanning
          </button>
        )}
        {scanning && (
          <button
            onClick={stopScanner}
            className="w-full py-3.5 bg-[#21262d] hover:bg-[#30363d] text-white font-semibold rounded-lg transition-colors"
          >
            Stop Scanner
          </button>
        )}

        {/* Processing */}
        {processing && (
          <div className="flex items-center justify-center gap-3 py-6">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <span className="text-white">Processing...</span>
          </div>
        )}

        {/* Result */}
        {result && !processing && (
          <div className={`rounded-xl p-6 border ${
            result.type === 'success' ? 'bg-green-900/20 border-green-500/30' :
            result.type === 'already' ? 'bg-yellow-900/20 border-yellow-500/30' :
            'bg-red-900/20 border-red-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {result.type === 'success' && <CheckCircle size={28} className="text-green-400" />}
              {result.type === 'already' && <CheckCircle size={28} className="text-yellow-400" />}
              {result.type === 'error' && <XCircle size={28} className="text-red-400" />}
              <h3 className={`text-lg font-bold ${
                result.type === 'success' ? 'text-green-400' :
                result.type === 'already' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {result.type === 'success' && 'Checked In!'}
                {result.type === 'already' && 'Already Checked In'}
                {result.type === 'error' && 'Error'}
              </h3>
            </div>

            {(result.name || result.reg_no) && (
              <div className="space-y-1.5 mb-4">
                {result.name && (
                  <p className="text-white font-medium">{result.name}</p>
                )}
                {result.reg_no && (
                  <p className="text-[#7d8590] font-mono text-sm">{result.reg_no}</p>
                )}
              </div>
            )}
            {result.message && (
              <p className="text-[#7d8590] text-sm mb-4">{result.message}</p>
            )}

            <button
              onClick={resetScan}
              className="w-full py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
