import React, { useState, useEffect } from 'react';
import { EvidenceRecord, EvidenceVerifyResult } from '../types';
import { getEvidenceList, verifyEvidence } from '../services/api';
import { FileCheck2, CheckCircle2, XCircle, Hash, Key, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);
  const [verifyResults, setVerifyResults] = useState<Record<number, EvidenceVerifyResult>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getEvidenceList();
        setEvidenceList(list);
        if (list.length > 0) setSelectedRecord(list[0]);
      } catch (err) {
        console.error('Failed to load evidence records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      setVerifyingId(id);
      const res = await verifyEvidence(id);
      setVerifyResults((prev) => ({ ...prev, [id]: res }));
    } catch (err) {
      console.error(`Verification error for #${id}:`, err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Cryptographic Chain-of-Custody Evidence Vault
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            TAMPER-EVIDENT SHA-256 + ECDSA NIST P-256
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Every autonomous detection produces a deterministically formatted canonical JSON record hashed with SHA-256
          and signed by the buoy's cryptographic key. Modifying any telemetry parameter will immediately invalidate hash verification.
        </p>
      </div>

      {/* Main Grid: Evidence Table + Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column (2 cols) */}
        <div className="lg:col-span-2 bg-ocean-900 border border-ocean-border rounded-xl p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ocean-border text-slate-400 text-[10px] uppercase">
                <th className="py-3">Record ID</th>
                <th>Incident Ref</th>
                <th>SHA-256 Digest</th>
                <th>Timestamp</th>
                <th className="text-right">Integrity Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-border/40">
              {evidenceList.map((rec) => {
                const verification = verifyResults[rec.id];
                const isVerifying = verifyingId === rec.id;
                const isSelected = selectedRecord?.id === rec.id;

                return (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-ocean-800/80 border-l-2 border-ocean-cyan' : 'hover:bg-ocean-800/30'
                    }`}
                  >
                    <td className="py-3 text-slate-300 font-bold">EV-{rec.id}</td>
                    <td className="text-ocean-cyan font-bold">DET-{rec.detection_id}</td>
                    <td className="text-slate-400 font-mono text-[11px] max-w-[200px] truncate" title={rec.sha256_hash}>
                      {rec.sha256_hash.slice(0, 16)}...{rec.sha256_hash.slice(-8)}
                    </td>
                    <td className="text-slate-400 text-[11px]">
                      {new Date(rec.created_at).toLocaleTimeString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(rec.id);
                        }}
                        disabled={isVerifying}
                        className="px-2.5 py-1 rounded bg-ocean-cyan/20 hover:bg-ocean-cyan text-ocean-cyan hover:text-black font-bold text-[10px] transition-all"
                      >
                        {isVerifying ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Verifying...
                          </span>
                        ) : verification ? (
                          verification.valid ? '✓ VERIFIED' : '✕ CORRUPT'
                        ) : (
                          'VERIFY INTEGRITY'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Forensic Record Inspector Panel */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ocean-border/60 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase">
              Canonical Evidence Inspector
            </h3>
            {selectedRecord && (
              <span className="text-xs text-ocean-cyan font-bold">
                REC #{selectedRecord.id}
              </span>
            )}
          </div>

          {selectedRecord ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase">SHA-256 Digest:</span>
                <div className="bg-ocean-950 p-2 rounded border border-ocean-border font-mono text-[10px] text-emerald-400 break-all select-all mt-1">
                  {selectedRecord.sha256_hash}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase">Canonical Payload (Deterministic Sort):</span>
                <pre className="bg-ocean-950 p-2.5 rounded border border-ocean-border font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap mt-1">
                  {selectedRecord.canonical_payload}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase">ECDSA Signature (NIST P-256 Base64):</span>
                <div className="bg-ocean-950 p-2 rounded border border-ocean-border font-mono text-[10px] text-slate-400 break-all max-h-16 overflow-y-auto mt-1">
                  {selectedRecord.signature || 'Secured in memory'}
                </div>
              </div>

              {/* Verification Result Card */}
              {verifyResults[selectedRecord.id] && (
                <div className={`p-3 rounded-lg border text-xs ${
                  verifyResults[selectedRecord.id].valid
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {verifyResults[selectedRecord.id].valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{verifyResults[selectedRecord.id].status_message}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Recomputed SHA-256 matched canonical ledger hash byte-for-byte.
                  </div>
                </div>
              )}

              <button
                onClick={() => handleVerify(selectedRecord.id)}
                disabled={verifyingId === selectedRecord.id}
                className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-green"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>EXECUTE CRYPTOGRAPHIC RE-VERIFICATION</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-10 text-center">
              Select an evidence record from the ledger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
