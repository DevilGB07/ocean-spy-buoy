import React, { useEffect, useRef } from 'react';
import { Volume2, Activity, Radio, AudioWaveform } from 'lucide-react';
import { Detection } from '../types';

interface AcousticWaveformPanelProps {
  detection: Detection | null;
}

export const AcousticWaveformPanel: React.FC<AcousticWaveformPanelProps> = ({ detection }) => {
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Waveform Rendering
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Draw grid lines
      ctx.strokeStyle = 'rgba(30, 50, 96, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw dynamic acoustic waveform
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const freq = detection?.dominant_frequency_hz || 142.5;
      const amp = Math.min(35, Math.max(10, ((detection?.audio_level_db || -32) + 60) * 1.2));

      for (let x = 0; x < width; x++) {
        // Multi-frequency synthesis (fundamental + engine harmonic + cavitation noise)
        const f1 = Math.sin((x * 0.04) + phase);
        const f2 = Math.sin((x * 0.08) - (phase * 1.5)) * 0.4;
        const noise = (Math.random() - 0.5) * 4;
        const y = midY + (f1 + f2) * amp + noise;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      phase += 0.06;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [detection]);

  // Spectrogram Waterfall Simulator
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const drawSpectrogram = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Shift existing image to the left
      const imgData = ctx.getImageData(2, 0, width - 2, height);
      ctx.putImageData(imgData, 0, 0);

      // Draw new column at right edge
      const colX = width - 2;
      const domFreqY = Math.floor(height * 0.4); // dominant engine line

      for (let y = 0; y < height; y++) {
        let intensity = Math.random() * 0.25; // background ocean noise
        // Engine rumble resonance band
        if (Math.abs(y - domFreqY) < 4) {
          intensity += 0.75 + Math.sin(step * 0.1) * 0.2;
        } else if (Math.abs(y - (domFreqY * 1.8)) < 3) {
          intensity += 0.45; // 2nd harmonic
        }

        // Color mapping from navy to cyan to bright yellow
        const r = Math.floor(intensity > 0.7 ? (intensity - 0.7) * 800 : 0);
        const g = Math.floor(intensity * 230);
        const b = Math.floor(255 * Math.min(1, intensity + 0.2));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(colX, y, 2, 1);
      }

      step++;
      animId = requestAnimationFrame(drawSpectrogram);
    };

    drawSpectrogram();
    return () => cancelAnimationFrame(animId);
  }, [detection]);

  return (
    <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ocean-border/60 pb-2">
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-4 h-4 text-ocean-cyan" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Acoustic Signal Processing
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-cyan/10 border border-ocean-cyan/30 text-ocean-cyan font-semibold">
          SIMULATED ACOUSTIC INPUT
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="bg-ocean-950/70 p-2 rounded border border-ocean-border/50">
          <div className="text-[10px] text-slate-400">ACOUSTIC STATUS</div>
          <div className="text-emerald-400 font-bold mt-0.5">
            {detection ? 'VESSEL DETECTED' : 'MONITORING'}
          </div>
        </div>
        <div className="bg-ocean-950/70 p-2 rounded border border-ocean-border/50">
          <div className="text-[10px] text-slate-400">AI CLASSIFICATION</div>
          <div className="text-ocean-cyan font-bold mt-0.5">
            {detection ? `${detection.vessel_type} (${Math.round(detection.confidence * 100)}%)` : '--'}
          </div>
        </div>
        <div className="bg-ocean-950/70 p-2 rounded border border-ocean-border/50">
          <div className="text-[10px] text-slate-400">ENERGY LEVEL</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {detection?.audio_level_db ? `${detection.audio_level_db.toFixed(1)} dBFS` : '-31.2 dBFS'}
          </div>
        </div>
        <div className="bg-ocean-950/70 p-2 rounded border border-ocean-border/50">
          <div className="text-[10px] text-slate-400">PEAK FREQUENCY</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {detection?.dominant_frequency_hz ? `${detection.dominant_frequency_hz.toFixed(1)} Hz` : '142.5 Hz'}
          </div>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>HYDROPHONE RAW HYDROACOUSTIC WAVEFORM (48 kHz / 16-bit)</span>
          <span>WINDOW: 1.0s</span>
        </div>
        <canvas
          ref={waveformCanvasRef}
          width={600}
          height={80}
          className="w-full h-20 bg-ocean-950 rounded border border-ocean-border/70 block"
        />
      </div>

      {/* Spectrogram Canvas */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>REAL-TIME FFT FREQUENCY SPECTROGRAM (0–1000 Hz)</span>
          <span>WATERFALL: 20 FPS</span>
        </div>
        <canvas
          ref={spectrogramCanvasRef}
          width={600}
          height={75}
          className="w-full h-18 bg-ocean-950 rounded border border-ocean-border/70 block"
        />
      </div>
    </div>
  );
};
