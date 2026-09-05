import React, { useEffect, useState } from 'react';
import { Detection, EvidenceRecord, EvidenceVerifyResult } from '../types';
import { getDetection, getEvidence, verifyEvidence } from '../services/api';
import { ForensicTimeline } from '../components/ForensicTimeline';
import { AcousticWaveformPanel } from '../components/AcousticWaveformPanel';
import { ArrowLeft, ShieldAlert, CheckCircle2, Hash, KeyRound, ExternalLink, RefreshCw, Cpu, Radio, Eye } from 'lucide-react';

interface DetectionDetailPageProps {
  detectionId: number;
  onBack: () => void;
}

export const DetectionDetailPage: React.FC<DetectionDetailPageProps> = ({
  detectionId,
  onBack
}) => {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [verifyResult, setVerifyResult] = useState<EvidenceVerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const det = await getDetection(detectionId);
        setDetection(det);

        // Try load evidence record for this detection
        try {
          const ev = await getEvidence(detectionId);
          setEvidence(ev);
        } catch {
          // If direct id lookup differs, we still display detection
        }
      } catch (err) {
        console.error('Error fetching detection details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [detectionId]);

  const handleVerifyEvidence = async () => {
    if (!evidence) return;
    try {
      setVerifying(true);
      const res = await verifyEvidence(evidence.id);
      setVerifyResult(res);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ocean-cyan" />
        LOADING FORENSIC DOSSIER #{detectionId}...
      </div>
    );
  }

  if (!detection) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Detection #{detectionId} not found.
        <button onClick={onBack} className="block mx-auto mt-4 px-4 py-2 bg-ocean-800 text-white rounded">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const reasons = detection.reasons_list || [];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between gap-4 border-b border-ocean-border/60 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-900 border border-ocean-border text-slate-300 hover:text-white hover:bg-ocean-800 text-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO SURVEILLANCE</span>
        </button>

        <div className="text-right">
          <div className="text-xs text-slate-400">INCIDENT DOSSIER</div>
          <div className="text-base font-bold text-ocean-cyan">DETECTION #{detection.id}</div>
        </div>
      </div>

      {/* Main Incident Dossier Overview */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">TIMESTAMP (UTC):</span>
            <strong className="text-slate-100 text-sm">{new Date(detection.timestamp).toISOString()}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">ACOUSTIC CLASSIFICATION:</span>
            <strong className="text-ocean-cyan text-sm uppercase">{detection.vessel_type} ({Math.round(detection.confidence * 100)}%)</strong>
          </div>
          <div>
            <span className="text-slate-400 block">AIS CORRELATION:</span>
            <strong className={`text-sm ${
              detection.ais_status === 'NO_AIS_MATCH' ? 'text-rose-400' :
              detection.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {detection.ais_status.replace(/_/g, ' ')}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block">INVESTIGATION PRIORITY:</span>
            <strong className={`text-sm font-black ${
              detection.risk_score >= 80 ? 'text-rose-400' :
              detection.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {detection.risk_score} / 100 ({detection.status.replace(/_/g, ' ')})
            </strong>
          </div>
        </div>
      </div>

      {/* Explainable Risk Reasons & Sensor Fusion Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Explainable Reason List (Section 16) */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-ocean-border/60 pb-3">
            <Cpu className="w-4 h-4 text-ocean-cyan" />
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              Explainable Risk Engine Rationale
            </h3>
          </div>

          <div className="space-y-2">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs bg-ocean-950 p-2.5 rounded border border-ocean-border/60">
                <span className="text-ocean-cyan font-bold">✓</span>
                <span className="text-slate-200">{reason}</span>
              </div>
            ))}
          </div>

          <div className="bg-ocean-950/80 p-3 rounded-lg border border-ocean-border/80">
            <div className="text-[10px] text-slate-400 uppercase">OPERATIONAL RECOMMENDATION</div>
            <div className="text-xs text-slate-100 font-sans mt-1">
              "{detection.recommendation}"
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              * Non-presumptive surveillance statement. Does NOT imply legal adjudication.
            </div>
          </div>
        </div>

        {/* Right: Cryptographic Evidence & SHA-256 Vault */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ocean-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Tamper-Evident Evidence Vault
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
              SHA-256 + ECDSA
            </span>
          </div>

          {evidence ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">SHA-256 DIGEST:</span>
                <div className="bg-ocean-950 p-2 rounded border border-ocean-border font-mono text-[11px] text-emerald-400 break-all select-all">
                  {evidence.sha256_hash}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">CANONICAL PAYLOAD (DETERMINISTIC JSON):</span>
                <pre className="bg-ocean-950 p-2.5 rounded border border-ocean-border font-mono text-[10px] text-slate-300 overflow-x-auto max-h-32">
                  {evidence.canonical_payload}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleVerifyEvidence}
                  disabled={verifying}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-green"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{verifying ? 'VERIFYING...' : 'RE-VERIFY INTEGRITY'}</span>
                </button>

                {verifyResult && (
                  <span className={`text-[11px] font-bold ${verifyResult.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verifyResult.status_message}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-4 bg-ocean-950 rounded">
              Evidence record generated automatically on ingest. View full evidence log in the Evidence tab.
            </div>
          )}
        </div>
      </div>

      {/* Acoustic Waveform & Forensic Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <AcousticWaveformPanel detection={detection} />
        </div>
        <div>
          <ForensicTimeline detection={detection} />
        </div>
      </div>
    </div>
  );
};
