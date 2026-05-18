/**
 * BioSimulator.tsx
 * CRISPR-Cas9 Gene Therapy Interactive Simulator
 * Hard Sci-Fi / Cyber-Biometric HUD aesthetic
 * Designed for iPad Pro kiosk mode (100vh, no scroll)
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 0 | 1 | 2 | 3;
type Mutation = "HBB" | "CEP290" | null;
type TeleMode = "idle" | "crit" | "proc" | "supra";

interface TeleValue {
  val: string;
  pct: number;
  mode: "normal" | "crit" | "supra";
}

interface TeleState {
  hr: TeleValue; bp: TeleValue; o2: TeleValue;
  temp: TeleValue; vl: TeleValue; seq: TeleValue;
  cas: TeleValue; err: TeleValue; hdr: TeleValue;
  pot: TeleValue;
}

// ─── SVG Components ───────────────────────────────────────────────────────────

const HumanIdleSVG = () => (
  <svg viewBox="0 0 220 360" width="220" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="body-glow">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    {/* Head */}
    <circle cx="110" cy="38" r="26" fill="none" stroke="#00F0FF" strokeWidth="1.2" filter="url(#body-glow)" opacity=".7" />
    {/* Spine */}
    <line x1="110" y1="64" x2="110" y2="200" stroke="#00F0FF" strokeWidth="1.2" opacity=".7" />
    {/* Shoulders / Arms */}
    <line x1="110" y1="90" x2="64" y2="155" stroke="#00F0FF" strokeWidth="1.2" opacity=".6" />
    <line x1="110" y1="90" x2="156" y2="155" stroke="#00F0FF" strokeWidth="1.2" opacity=".6" />
    {/* Legs */}
    <line x1="110" y1="200" x2="80" y2="300" stroke="#00F0FF" strokeWidth="1.2" opacity=".7" />
    <line x1="110" y1="200" x2="140" y2="300" stroke="#00F0FF" strokeWidth="1.2" opacity=".7" />
    <line x1="80" y1="300" x2="72" y2="346" stroke="#00F0FF" strokeWidth="1.2" opacity=".6" />
    <line x1="140" y1="300" x2="148" y2="346" stroke="#00F0FF" strokeWidth="1.2" opacity=".6" />
    {/* Shoulders */}
    <ellipse cx="91" cy="104" rx="14" ry="12" fill="none" stroke="#00F0FF" strokeWidth=".8" opacity=".4" />
    <ellipse cx="129" cy="104" rx="14" ry="12" fill="none" stroke="#00F0FF" strokeWidth=".8" opacity=".4" />
    {/* Torso */}
    <ellipse cx="110" cy="148" rx="22" ry="26" fill="none" stroke="#00F0FF" strokeWidth=".8" opacity=".3" />
    {/* Scan lines */}
    {[80, 120, 165, 210, 250].map(y => (
      <line key={y} x1="60" y1={y} x2="160" y2={y} stroke="#00F0FF" strokeWidth=".6" strokeDasharray="3 4" opacity=".2" />
    ))}
    {/* Labels */}
    <text x="8" y="90" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".3" letterSpacing="1">SIS.CRD</text>
    <text x="8" y="150" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".3" letterSpacing="1">SIS.RES</text>
    <text x="158" y="90" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".3">HBB</text>
    <text x="158" y="310" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".3">CEP290</text>
  </svg>
);

const HumanFaultHBBSVG = () => (
  <svg viewBox="0 0 220 360" width="220" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="r-glow">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <circle cx="110" cy="38" r="26" fill="none" stroke="#00F0FF" strokeWidth="1" opacity=".4" />
    <line x1="110" y1="64" x2="110" y2="200" stroke="#00F0FF" strokeWidth="1" opacity=".35" />
    <line x1="110" y1="90" x2="64" y2="155" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="90" x2="156" y2="155" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="200" x2="80" y2="300" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="200" x2="140" y2="300" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="80" y1="300" x2="72" y2="346" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="140" y1="300" x2="148" y2="346" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    {/* Cardiac fault zone */}
    <ellipse cx="110" cy="115" rx="20" ry="18" fill="#FF003C22" stroke="#FF003C" strokeWidth="1.5"
      filter="url(#r-glow)" style={{ animation: "alertPulse .7s infinite" }} />
    <path d="M110 104 C104 108 100 114 104 119 C108 124 112 122 116 119 C120 114 116 108 110 104Z"
      fill="#FF003C" opacity=".6" filter="url(#r-glow)" />
    <text x="134" y="112" fill="#FF003C" fontFamily="JetBrains Mono,monospace" fontSize="8" opacity=".9">← HBB</text>
    <text x="134" y="122" fill="#FF003C" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".6">MUTANTE</text>
  </svg>
);

const HumanFaultCEPSVG = () => (
  <svg viewBox="0 0 220 360" width="220" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="r-glow2">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <circle cx="110" cy="38" r="26" fill="none" stroke="#00F0FF" strokeWidth="1" opacity=".4" />
    <line x1="110" y1="64" x2="110" y2="200" stroke="#00F0FF" strokeWidth="1" opacity=".35" />
    <line x1="110" y1="90" x2="64" y2="155" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="90" x2="156" y2="155" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="200" x2="80" y2="300" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="110" y1="200" x2="140" y2="300" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="80" y1="300" x2="72" y2="346" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    <line x1="140" y1="300" x2="148" y2="346" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    {/* Optic fault zones */}
    <ellipse cx="96" cy="45" rx="10" ry="8" fill="#FF003C22" stroke="#FF003C" strokeWidth="1.5"
      filter="url(#r-glow2)" style={{ animation: "alertPulse .6s infinite" }} />
    <ellipse cx="124" cy="45" rx="10" ry="8" fill="#FF003C22" stroke="#FF003C" strokeWidth="1.5"
      filter="url(#r-glow2)" style={{ animation: "alertPulse .6s infinite alternate" }} />
    <circle cx="96" cy="45" r="4" fill="#FF003C" opacity=".7" filter="url(#r-glow2)" />
    <circle cx="124" cy="45" r="4" fill="#FF003C" opacity=".7" filter="url(#r-glow2)" />
    <text x="64" y="22" fill="#FF003C" fontFamily="JetBrains Mono,monospace" fontSize="7">CEP290 ← FALLA ÓPTICA</text>
  </svg>
);

interface DNASVGProps {
  mutationLabel: string;
  healed: boolean;
}

const DNACRISPRSVG = ({ mutationLabel, healed }: DNASVGProps) => (
  <svg viewBox="0 0 360 200" width="360" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="err-glow"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="ok-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    {/* Left segment */}
    <line x1="20" y1="60" x2="120" y2="60" stroke="#00F0FF" strokeWidth="2" opacity=".8" />
    <line x1="20" y1="140" x2="120" y2="140" stroke="#00F0FF" strokeWidth="2" opacity=".8" />
    {[30, 45, 60, 75, 90, 105].map(x => (
      <line key={x} x1={x} y1="60" x2={x} y2="140" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    ))}
    {/* Error segment */}
    <rect x="130" y="46" width="100" height="108" rx="2"
      fill={healed ? "#39FF1411" : "#FF003C11"}
      stroke={healed ? "#39FF14" : "#FF003C"}
      strokeWidth="1.5"
      filter={healed ? "url(#ok-glow)" : "url(#err-glow)"}
    />
    <line x1="130" y1="60" x2="230" y2="60" stroke={healed ? "#39FF14" : "#FF003C"} strokeWidth="2.5" />
    <line x1="130" y1="140" x2="230" y2="140" stroke={healed ? "#39FF14" : "#FF003C"} strokeWidth="2.5" />
    {[140, 155, 170, 185, 200, 215].map(x => (
      <line key={x} x1={x} y1="60" x2={x} y2="140" stroke={healed ? "#39FF14" : "#FF003C"} strokeWidth="1" opacity=".5" />
    ))}
    <text x="180" y="96" textAnchor="middle" fill={healed ? "#39FF14" : "#FF003C"}
      fontFamily="JetBrains Mono,monospace" fontSize="9" fontWeight="700">
      {healed ? "[CORREGIDO]" : `[${mutationLabel}]`}
    </text>
    <text x="180" y="112" textAnchor="middle" fill={healed ? "#39FF14" : "#FF003C"}
      fontFamily="JetBrains Mono,monospace" fontSize="8" opacity=".7">
      {healed ? "HDR OK" : "ERROR"}
    </text>
    {/* Right segment */}
    <line x1="240" y1="60" x2="340" y2="60" stroke="#00F0FF" strokeWidth="2" opacity=".8" />
    <line x1="240" y1="140" x2="340" y2="140" stroke="#00F0FF" strokeWidth="2" opacity=".8" />
    {[250, 265, 280, 295, 310, 325].map(x => (
      <line key={x} x1={x} y1="60" x2={x} y2="140" stroke="#00F0FF" strokeWidth="1" opacity=".3" />
    ))}
    {/* Crosshair */}
    {!healed && (
      <g style={{ transition: "transform .5s", transformOrigin: "180px 100px" }}>
        <line x1="180" y1="10" x2="180" y2="40" stroke="#FFFFFF" strokeWidth="1.2" opacity=".8" />
        <line x1="180" y1="160" x2="180" y2="190" stroke="#FFFFFF" strokeWidth="1.2" opacity=".8" />
        <line x1="100" y1="100" x2="130" y2="100" stroke="#FFFFFF" strokeWidth="1.2" opacity=".8" />
        <line x1="230" y1="100" x2="260" y2="100" stroke="#FFFFFF" strokeWidth="1.2" opacity=".8" />
        <circle cx="180" cy="100" r="30" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity=".5" strokeDasharray="4 4" />
        <circle cx="180" cy="100" r="6" fill="none" stroke="#FF003C" strokeWidth="1.5" />
        <line x1="180" y1="94" x2="180" y2="106" stroke="#FF003C" strokeWidth="1" />
        <line x1="174" y1="100" x2="186" y2="100" stroke="#FF003C" strokeWidth="1" />
      </g>
    )}
  </svg>
);

const HumanEnhancedHBBSVG = () => (
  <svg viewBox="0 0 220 360" width="220" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="c-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <circle cx="110" cy="38" r="26" fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity=".8" />
    <line x1="110" y1="64" x2="110" y2="200" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="110" y1="90" x2="64" y2="155" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="110" y1="90" x2="156" y2="155" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="110" y1="200" x2="80" y2="300" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="110" y1="200" x2="140" y2="300" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="80" y1="300" x2="72" y2="346" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="140" y1="300" x2="148" y2="346" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    {/* Enhanced cardiac zone */}
    <ellipse cx="110" cy="115" rx="28" ry="24" fill="#00F0FF18" stroke="#00F0FF" strokeWidth="2" filter="url(#c-glow)" />
    <ellipse cx="110" cy="115" rx="16" ry="14" fill="#00F0FF33" stroke="#00F0FF" strokeWidth="1.5" filter="url(#c-glow)" />
    <path d="M110 104 C104 108 100 114 104 119 C108 124 112 122 116 119 C120 114 116 108 110 104Z"
      fill="#00F0FF" opacity=".9" filter="url(#c-glow)" />
    <text x="2" y="110" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".8">HBB+</text>
    <text x="2" y="120" fill="#00F0FF" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".6">350%</text>
  </svg>
);

const HumanEnhancedCEPSVG = () => (
  <svg viewBox="0 0 220 360" width="220" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="g-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <circle cx="110" cy="38" r="26" fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity=".8" />
    <line x1="110" y1="64" x2="110" y2="200" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="110" y1="90" x2="64" y2="155" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="110" y1="90" x2="156" y2="155" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="110" y1="200" x2="80" y2="300" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="110" y1="200" x2="140" y2="300" stroke="#00F0FF" strokeWidth="1.5" opacity=".7" />
    <line x1="80" y1="300" x2="72" y2="346" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <line x1="140" y1="300" x2="148" y2="346" stroke="#00F0FF" strokeWidth="1.5" opacity=".6" />
    <ellipse cx="96" cy="45" rx="14" ry="11" fill="#39FF1422" stroke="#39FF14" strokeWidth="2" filter="url(#g-glow)" />
    <ellipse cx="124" cy="45" rx="14" ry="11" fill="#39FF1422" stroke="#39FF14" strokeWidth="2" filter="url(#g-glow)" />
    <circle cx="96" cy="45" r="5" fill="#39FF14" opacity=".9" filter="url(#g-glow)" />
    <circle cx="124" cy="45" r="5" fill="#39FF14" opacity=".9" filter="url(#g-glow)" />
    <text x="2" y="35" fill="#39FF14" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".8">CEP290+</text>
    <text x="2" y="45" fill="#39FF14" fontFamily="JetBrains Mono,monospace" fontSize="7" opacity=".6">IR/UV</text>
  </svg>
);

// ─── Telemetry Hook ───────────────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}
function rndF(min: number, max: number, dec: number): string {
  return (Math.random() * (max - min) + min).toFixed(dec);
}

function buildTele(mode: TeleMode): TeleState {
  if (mode === "idle") return {
    hr: { val: `${rnd(68, 76)} bpm`, pct: rnd(50, 65), mode: "normal" },
    bp: { val: `${rnd(114, 122)} mmHg`, pct: rnd(48, 58), mode: "normal" },
    o2: { val: `${rndF(97.2, 99.4, 1)}%`, pct: rnd(88, 96), mode: "normal" },
    temp: { val: `${rndF(36.5, 37.1, 1)} °C`, pct: rnd(44, 52), mode: "normal" },
    vl: { val: "0.00 IU/mL", pct: 2, mode: "normal" },
    seq: { val: `${rndF(2.8, 4.1, 1)}M`, pct: rnd(25, 38), mode: "normal" },
    cas: { val: "0.0 nM", pct: 0, mode: "normal" },
    err: { val: "0", pct: 0, mode: "normal" },
    hdr: { val: "—", pct: 0, mode: "normal" },
    pot: { val: `−${rnd(70, 74)} mV`, pct: rnd(38, 46), mode: "normal" },
  };
  if (mode === "crit") return {
    hr: { val: `${rnd(110, 165)} bpm`, pct: rnd(70, 95), mode: "crit" },
    bp: { val: `${rnd(145, 195)} mmHg`, pct: rnd(75, 95), mode: "crit" },
    o2: { val: `${rndF(74, 86, 1)}%`, pct: rnd(40, 60), mode: "crit" },
    temp: { val: `${rndF(38.8, 40.2, 1)} °C`, pct: rnd(75, 90), mode: "crit" },
    vl: { val: `${rnd(1200, 8900)} IU/mL`, pct: rnd(55, 85), mode: "crit" },
    seq: { val: `${rndF(0.1, 0.8, 1)}M`, pct: rnd(5, 15), mode: "crit" },
    cas: { val: "0.0 nM", pct: 0, mode: "normal" },
    err: { val: `${rnd(1200, 9800)}`, pct: rnd(60, 90), mode: "crit" },
    hdr: { val: "FALLO", pct: 5, mode: "crit" },
    pot: { val: `−${rnd(30, 50)} mV`, pct: rnd(10, 30), mode: "crit" },
  };
  if (mode === "proc") return {
    hr: { val: `${rnd(90, 110)} bpm`, pct: rnd(60, 75), mode: "normal" },
    bp: { val: `${rnd(120, 140)} mmHg`, pct: rnd(58, 70), mode: "normal" },
    o2: { val: `${rndF(90, 96, 1)}%`, pct: rnd(70, 85), mode: "normal" },
    temp: { val: `${rndF(37.5, 38.5, 1)} °C`, pct: rnd(58, 68), mode: "normal" },
    vl: { val: `${rnd(200, 800)} IU/mL`, pct: rnd(25, 45), mode: "normal" },
    seq: { val: `${rnd(18, 48)}M`, pct: rnd(60, 90), mode: "normal" },
    cas: { val: `${rndF(2.4, 8.9, 1)} nM`, pct: rnd(40, 80), mode: "normal" },
    err: { val: `${rnd(0, 3)}`, pct: rnd(0, 8), mode: "normal" },
    hdr: { val: `${rnd(72, 98)}%`, pct: rnd(72, 98), mode: "normal" },
    pot: { val: `−${rnd(55, 68)} mV`, pct: rnd(30, 45), mode: "normal" },
  };
  // supra
  return {
    hr: { val: `${rnd(42, 48)} bpm`, pct: rnd(30, 38), mode: "supra" },
    bp: { val: `${rnd(95, 105)} mmHg`, pct: rnd(35, 45), mode: "normal" },
    o2: { val: `${rnd(340, 365)}%`, pct: 100, mode: "supra" },
    temp: { val: `${rndF(37.0, 37.2, 1)} °C`, pct: rnd(42, 46), mode: "normal" },
    vl: { val: "0.00 IU/mL", pct: 1, mode: "normal" },
    seq: { val: `${rnd(88, 124)}M`, pct: 100, mode: "supra" },
    cas: { val: "∞ nM", pct: 100, mode: "supra" },
    err: { val: "0", pct: 0, mode: "supra" },
    hdr: { val: "99.99%", pct: 100, mode: "supra" },
    pot: { val: `+${rnd(85, 120)} mV`, pct: 100, mode: "supra" },
  };
}

function useTelemetry(mode: TeleMode) {
  const [tele, setTele] = useState<TeleState>(() => buildTele(mode));
  useEffect(() => {
    setTele(buildTele(mode));
    const speed = mode === "crit" ? 180 : mode === "proc" ? 260 : 620;
    const t = setInterval(() => setTele(buildTele(mode)), speed);
    return () => clearInterval(t);
  }, [mode]);
  return tele;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TeleBlockProps { label: string; value: TeleValue }

const TeleBlock = ({ label, value }: TeleBlockProps) => {
  const color = value.mode === "crit" ? "#FF003C" : value.mode === "supra" ? "#39FF14" : "#00F0FF";
  return (
    <div style={{ border: "1px solid #151515", padding: "8px 10px", background: "#060606" }}>
      <div style={{ fontSize: 8, color: "#333", letterSpacing: 2, marginBottom: 4, fontFamily: "JetBrains Mono,monospace" }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color, fontWeight: 700, fontFamily: "JetBrains Mono,monospace",
        animation: value.mode === "crit" ? "flicker .15s infinite" : "none",
        transition: "color .1s"
      }}>
        {value.val}
      </div>
      <div style={{ height: 2, background: "#111", marginTop: 5, position: "relative", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${value.pct}%`, transition: "width .3s, background .2s" }} />
      </div>
    </div>
  );
};

const ScanLine = () => (
  <div style={{
    position: "absolute", left: 0, right: 0, height: 2,
    background: "linear-gradient(90deg,transparent,#00F0FF,transparent)",
    boxShadow: "0 0 12px #00F0FF, 0 0 24px #00F0FF44",
    animation: "scan 2.8s ease-in-out infinite",
    opacity: .7, pointerEvents: "none",
  }} />
);

// ─── Console Lines ────────────────────────────────────────────────────────────

const CONSOLE_LINES = [
  { text: "> CONECTANDO ARN GUÍA A COMPLEJO Cas9...", color: "#00F0FF" },
  { text: "> BUSCANDO SECUENCIA PAM: [NGG]...", color: "#00F0FF" },
  { text: "> OBJETIVO LOCALIZADO.", color: "#00F0FF" },
  { text: "> RETÍCULA FIJADA. ACERCANDO Cas9...", color: "#00F0FF" },
  { text: "> INICIANDO CORTE DSB (DOBLE CADENA)...", color: "#FF003C" },
  { text: "> ⚡ CORTE EJECUTADO. ELIMINANDO SEGMENTO MUTANTE...", color: "#FF003C" },
  { text: "> ACTIVANDO PLANTILLA HDR...", color: "#00F0FF" },
  { text: "> INYECCIÓN Cas9: ÉXITO. REESCRIBIENDO CÓDIGO...", color: "#00F0FF" },
  { text: "> VERIFICANDO INTEGRIDAD GENÓMICA...", color: "#00F0FF" },
  { text: "> [ÉXITO] MUTACIÓN ELIMINADA. GENOMA ESTABLE.", color: "#39FF14" },
  { text: "> INICIANDO RECUPERACIÓN TISULAR...", color: "#39FF14" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BioSimulator() {
  const [phase, setPhase] = useState<Phase>(0);
  const [mutation, setMutation] = useState<Mutation>(null);
  const [teleMode, setTeleMode] = useState<TeleMode>("idle");
  const [consoleLines, setConsoleLines] = useState<typeof CONSOLE_LINES>([]);
  const [dnaHealed, setDnaHealed] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);
  const [faultView, setFaultView] = useState<Mutation>("HBB");
  const [clock, setClock] = useState("");
  const [sysLog, setSysLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  const tele = useTelemetry(teleMode);

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toTimeString().slice(0, 8));
    }, 1000);
    setClock(new Date().toTimeString().slice(0, 8));
    return () => clearInterval(t);
  }, []);

  // System log
  const LOG_MSGS = ["CHECKSUM OK", "BUFFER FLUSH", "GPIO SYNC", "PROT HANDSHAKE", "HEAP 42%", "IRQ CLEAR", "DMA READY", "PKT RECV"];
  useEffect(() => {
    const t = setInterval(() => {
      const msg = LOG_MSGS[Math.floor(Math.random() * LOG_MSGS.length)];
      const code = Math.random().toString(36).slice(-4).toUpperCase();
      setSysLog(prev => [`> ${msg} [${code}]`, ...prev].slice(0, 5));
    }, 1400);
    return () => clearInterval(t);
  }, []);

  // Phase 2: console typewriter + auto-advance
  useEffect(() => {
    if (phase !== 2) { setConsoleLines([]); setDnaHealed(false); return; }
    let li = 0;
    const t = setInterval(() => {
      if (li >= CONSOLE_LINES.length) { clearInterval(t); return; }
      
      // 1. Capturamos la línea exacta en memoria en este milisegundo
      const currentLine = CONSOLE_LINES[li];
      
      // 2. Actualizamos el estado con una protección contra el Strict Mode
      setConsoleLines(prev => {
        if (prev.includes(currentLine)) return prev; // Evita duplicados
        return [...prev, currentLine];
      });
      
      if (li === 7) setGlitching(true);
      if (li === 8) { setGlitching(false); setDnaHealed(true); }
      li++;
    }, 320);

    timerRef.current = setTimeout(() => {
      setPhase(3);
      setTeleMode("supra");
    }, 4000);

    return () => { clearInterval(t); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // Scroll console
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLines]);

  const goPhase1 = useCallback(() => { setPhase(1); setTeleMode("crit"); setFaultView("HBB"); }, []);
  const goPhase2 = useCallback((m: NonNullable<Mutation>) => {
    setMutation(m);
    setPhase(2);
    setTeleMode("proc");
  }, []);
  const reset = useCallback(() => {
    setFlashWhite(true);
    setTimeout(() => {
      setPhase(0); setMutation(null); setTeleMode("idle");
      setConsoleLines([]); setDnaHealed(false); setGlitching(false);
      setTimeout(() => setFlashWhite(false), 400);
    }, 500);
  }, []);

  const statusMap: Record<Phase, { text: string; color: string }> = {
    0: { text: "● SYS READY", color: "#444" },
    1: { text: "⚠ ANOMALÍA DETECTADA", color: "#FF003C" },
    2: { text: "◈ CRISPR ACTIVO", color: "#00F0FF" },
    3: { text: "✦ ADAPTACIÓN COMPLETA", color: "#39FF14" },
  };
  const phaseLabels = ["ESCANEO DE ORGANISMO", "FALLA SISTÉMICA DETECTADA", "INTERVENCIÓN CRISPR-Cas9", "ADAPTACIÓN COMPLETADA"];

  const isCep = mutation === "CEP290";
  const accentColor = isCep ? "#39FF14" : "#00F0FF";

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="biosim-root">
        {/* ── Top bar ── */}
        <div className="topbar">
          <span style={{ fontFamily: "VT323,monospace", fontSize: 22, color: "#00F0FF", letterSpacing: 3 }}>
            ◈ BIOFORGE // CRISPR-Cas9
          </span>
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#444", letterSpacing: 2, fontFamily: "JetBrains Mono,monospace" }}>
            <span style={{ color: statusMap[phase].color, transition: "color .3s" }}>{statusMap[phase].text}</span>
            <span>{clock}</span>
            <span>SESSION: BF-7741</span>
          </div>
          <span style={{ fontSize: 10, color: "#222", letterSpacing: 1, fontFamily: "JetBrains Mono,monospace" }}>
            OPERATOR: RESEARCH_NODE_Ω
          </span>
        </div>

        {/* ── Main 3-column grid ── */}
        <div className="main-grid">
          {/* ── Left panel ── */}
          <div className="side-panel">
            <div className="panel-section">TELEMETRÍA A</div>
            <TeleBlock label="FRECUENCIA CARDÍACA" value={tele.hr} />
            <TeleBlock label="PRESIÓN SISTÓLICA" value={tele.bp} />
            <TeleBlock label="OXIMETRÍA SpO2" value={tele.o2} />
            <TeleBlock label="TEMP. CORPORAL" value={tele.temp} />
            <TeleBlock label="CARGA VÍRICA" value={tele.vl} />
          </div>

          {/* ── Center stage ── */}
          <div className="center-stage">
            {/* Phase 0 */}
            {phase === 0 && (
              <div className="phase-container">
                <div style={{ fontSize: 9, color: "#333", letterSpacing: 4, marginBottom: 4, fontFamily: "JetBrains Mono,monospace" }}>
                  ORGANISMO IDENTIFICADO // BASELINE NORMAL
                </div>
                <div style={{ position: "relative" }}>
                  <HumanIdleSVG />
                  <ScanLine />
                </div>
                <div style={{ fontSize: 9, color: "#00F0FF44", letterSpacing: 3, fontFamily: "JetBrains Mono,monospace" }}>
                  ESCANEANDO SECUENCIAS...
                </div>
                <button className="hud-btn pulse" onClick={goPhase1}>
                  [ INICIAR DIAGNÓSTICO DE LÍNEA BASE ]
                </button>
                <div style={{ fontSize: 8, color: "#111", letterSpacing: 2, fontFamily: "JetBrains Mono,monospace" }}>
                  PROTOCOLO ΔΨ LISTO // CRISPR-Cas9 STANDBY
                </div>
              </div>
            )}

            {/* Phase 1 */}
            {phase === 1 && (
              <div className="phase-container" style={{ animation: "fadeSlide .3s ease" }}>
                <div className="alert-banner">
                  ⚠ ALERTA CLÍNICA SEVERA — MUTACIÓN DE LÍNEA GERMINAL DETECTADA ⚠
                </div>
                <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    {faultView === "HBB" ? <HumanFaultHBBSVG /> : <HumanFaultCEPSVG />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 9, color: "#FF003C", letterSpacing: 3, marginBottom: 8, fontFamily: "JetBrains Mono,monospace" }}>
                      SELECCIONAR PROTOCOLO DE INTERVENCIÓN:
                    </div>
                    <div className="target-card"
                      onMouseEnter={() => setFaultView("HBB")}
                      onClick={() => goPhase2("HBB")}>
                      <div className="tc-label">TARGET LOCK A</div>
                      <div className="tc-name">&gt; AISLAR MUTACIÓN HBB</div>
                      <div className="tc-code">chr11:5,246,696 [GAG→GTG]</div>
                      <div className="tc-sys">SISTEMA: CIRCULATORIO // HEMOGLOBINA</div>
                    </div>
                    <div className="target-card"
                      onMouseEnter={() => setFaultView("CEP290")}
                      onClick={() => goPhase2("CEP290")}>
                      <div className="tc-label">TARGET LOCK B</div>
                      <div className="tc-name">&gt; AISLAR MUTACIÓN CEP290</div>
                      <div className="tc-code">chr12:88,071,941 [IVS26+1G→A]</div>
                      <div className="tc-sys">SISTEMA: NERVIOSO // NERVIO ÓPTICO</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2 */}
            {phase === 2 && (
              <div className="phase-container" style={{ animation: "fadeSlide .3s ease" }}>
                <div style={{ fontSize: 9, color: "#00F0FF", letterSpacing: 3, fontFamily: "JetBrains Mono,monospace" }}>
                  CRISPR-Cas9 // INTERVENCIÓN GENÓMICA EN CURSO
                </div>
                <div style={{
                  animation: glitching ? "glitch .4s ease" : "none",
                  filter: glitching ? "brightness(1.5)" : "none",
                }}>
                  <DNACRISPRSVG
                    mutationLabel={mutation === "HBB" ? "HBB_G→T" : "CEP290_ΔG"}
                    healed={dnaHealed}
                  />
                </div>
                <div ref={consoleRef} style={{
                  fontFamily: "JetBrains Mono,monospace", fontSize: 11, color: "#39FF14",
                  width: 380, height: 72, overflow: "hidden",
                  background: "#050505", border: "1px solid #111", padding: "10px 12px",
                  lineHeight: 1.6, letterSpacing: .5,
                }}>
                  {consoleLines.map((l, i) => (
                    <div key={i} style={{ color: l.color }}>{l.text}</div>
                  ))}
                </div>
                <div style={{ fontSize: 8, color: "#333", letterSpacing: 2, fontFamily: "JetBrains Mono,monospace" }}>
                  GUÍA ARN ACTIVO // Cas9 ENDONUCLEASA DESPLEGADA
                </div>
              </div>
            )}

            {/* Phase 3 */}
            {phase === 3 && (
              <div className="phase-container" style={{ animation: "fadeSlide .4s ease" }}>
                <div style={{
                  background: `${accentColor}0a`, border: `1px solid ${accentColor}44`,
                  padding: "10px 24px", fontSize: 9, color: accentColor,
                  letterSpacing: 3, fontFamily: "JetBrains Mono,monospace",
                  animation: "alertPulse 1.5s infinite", textAlign: "center",
                }}>
                  ◈ ADAPTACIÓN MUTANTE COMPLETADA — ORGANISMO MEJORADO ◈
                </div>
                <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                  {isCep ? <HumanEnhancedCEPSVG /> : <HumanEnhancedHBBSVG />}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 220 }}>
                    <div style={{
                      fontSize: 9, color: accentColor, letterSpacing: 2,
                      borderLeft: `2px solid ${accentColor}`, paddingLeft: 8,
                      fontFamily: "JetBrains Mono,monospace",
                    }}>
                      {isCep ? "FOTORRECEPTORES CUÁNTICOS Mk-II" : "HEMOGLOBINA SINTÉTICA ΩX"}
                    </div>
                    <div style={{ fontSize: 9, color: "#333", letterSpacing: 1, lineHeight: 1.7, fontFamily: "JetBrains Mono,monospace" }}>
                      {isCep ? (
                        <>
                          <span style={{ color: accentColor }}>ESPECTRO AMPLIADO:</span> IR + UV<br />
                          <span style={{ color: accentColor }}>RESOLUCIÓN:</span> 320 Megapíxel<br />
                          <span style={{ color: accentColor }}>LÍMITE HAYFLICK:</span> ANULADO<br />
                          <span style={{ color: accentColor }}>ERRORES GENÓM:</span> 0 detectados
                        </>
                      ) : (
                        <>
                          <span style={{ color: accentColor }}>OXIGENACIÓN TISULAR:</span> 350%<br />
                          <span style={{ color: accentColor }}>V̇O2 MAX:</span> 312 mL/kg/min<br />
                          <span style={{ color: accentColor }}>LÍMITE HAYFLICK:</span> ANULADO<br />
                          <span style={{ color: accentColor }}>ERRORES GENÓM:</span> 0 detectados
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="hud-btn" style={{ borderColor: accentColor, color: accentColor, fontSize: 13, padding: "16px 32px" }} onClick={reset}>
                  [ ADAPTACIÓN MUTANTE COMPLETADA. REINICIAR MATRIZ ]
                </button>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="side-panel" style={{ borderLeft: "1px solid #111", borderRight: "none" }}>
            <div className="panel-section">TELEMETRÍA B</div>
            <TeleBlock label="SECUENCIAS ADN/s" value={tele.seq} />
            <TeleBlock label="CONCENTRACIÓN Cas9" value={tele.cas} />
            <TeleBlock label="ERRORES GENÓMICOS" value={tele.err} />
            <TeleBlock label="EFICIENCIA HDR" value={tele.hdr} />
            <TeleBlock label="POTENCIAL CELULAR" value={tele.pot} />
            <div style={{ border: "1px solid #151515", padding: "8px 10px", background: "#060606", marginTop: 4 }}>
              <div style={{ fontSize: 8, color: "#222", letterSpacing: 2, marginBottom: 6, fontFamily: "JetBrains Mono,monospace" }}>LOG SISTEMA</div>
              {sysLog.map((l, i) => (
                <div key={i} style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 1, lineHeight: 1.5, fontFamily: "JetBrains Mono,monospace" }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="bottombar">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginRight: 4, fontFamily: "JetBrains Mono,monospace" }}>FASE</span>
            {([0, 1, 2, 3] as Phase[]).map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i < phase ? "#1a3a1a" : i === phase ? "#00F0FF" : "#111",
                boxShadow: i === phase ? "0 0 6px #00F0FF" : "none",
                transition: "all .3s",
              }} />
            ))}
          </div>
          <span style={{ fontSize: 9, color: "#333", letterSpacing: 2, fontFamily: "JetBrains Mono,monospace" }}>
            {phaseLabels[phase]}
          </span>
          <span style={{ fontSize: 9, color: "#111", fontFamily: "JetBrains Mono,monospace" }}>
            GRCh38.p14 // CRISPR-Cas9 v4.1.7 // ΔΨ PROTOCOL
          </span>
        </div>

        {/* ── Corner decorations ── */}
        {(["tl", "tr", "bl", "br"] as const).map(c => (
          <div key={c} style={{
            position: "absolute",
            width: 18, height: 18, zIndex: 10,
            ...(c === "tl" ? { top: 48, left: 8, borderTop: "1px solid #00F0FF33", borderLeft: "1px solid #00F0FF33" } :
              c === "tr" ? { top: 48, right: 8, borderTop: "1px solid #00F0FF33", borderRight: "1px solid #00F0FF33" } :
              c === "bl" ? { bottom: 48, left: 8, borderBottom: "1px solid #00F0FF33", borderLeft: "1px solid #00F0FF33" } :
              { bottom: 48, right: 8, borderBottom: "1px solid #00F0FF33", borderRight: "1px solid #00F0FF33" }),
          }} />
        ))}

        {/* ── White flash overlay ── */}
        <div style={{
          position: "absolute", inset: 0, background: "white",
          opacity: flashWhite ? 1 : 0, transition: "opacity .4s",
          pointerEvents: flashWhite ? "all" : "none", zIndex: 50,
        }} />
      </div>
    </>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&family=VT323&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow: hidden; background: #030303; height: 100%; }

.biosim-root {
  width: 100vw; height: 100vh;
  background: #030303; color: #FFFFFF;
  font-family: 'JetBrains Mono', monospace;
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
  user-select: none;
}
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 44px; flex-shrink: 0;
  background: #050505; border-bottom: 1px solid #111;
}
.main-grid {
  flex: 1; display: grid;
  grid-template-columns: 192px 1fr 192px;
  overflow: hidden;
}
.side-panel {
  background: #0a0a0a; border-right: 1px solid #111;
  padding: 12px 8px; display: flex; flex-direction: column;
  gap: 8px; overflow: hidden;
}
.panel-section {
  font-size: 8px; color: #1e1e1e; letter-spacing: 3px;
  padding: 4px 0; border-bottom: 1px solid #0f0f0f; margin-bottom: 2px;
}
.center-stage {
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  background: radial-gradient(ellipse at center, #060608 0%, #030303 70%);
}
.phase-container {
  display: flex; flex-direction: column;
  align-items: center; gap: 18px; animation: fadeSlide .4s ease;
}
.bottombar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 42px; flex-shrink: 0;
  background: #050505; border-top: 1px solid #111;
}
.hud-btn {
  font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;
  letter-spacing: 2px; padding: 13px 28px;
  border: 1px solid #00F0FF; background: transparent; color: #00F0FF;
  cursor: pointer; text-transform: uppercase; outline: none;
  transition: background .15s, box-shadow .15s;
}
.hud-btn:hover { background: rgba(0,240,255,.08); box-shadow: 0 0 16px #00F0FF44; }
.hud-btn:active { transform: scale(.98); }
.hud-btn.pulse { animation: pulsebtn 2s ease-in-out infinite; }
.alert-banner {
  background: #FF003C11; border: 1px solid #FF003C44;
  padding: 8px 20px; font-size: 10px; color: #FF003C;
  letter-spacing: 3px; animation: alertPulse 1s infinite;
  text-align: center; font-family: 'JetBrains Mono', monospace;
}
.target-card {
  border: 1px solid #1a1a1a; padding: 14px 18px; cursor: pointer;
  min-width: 260px; font-size: 11px; letter-spacing: 1px; color: #888;
  background: #060606; transition: border-color .15s, color .15s, box-shadow .15s;
  text-align: left;
}
.target-card:hover { border-color: #FF003C; color: #FFFFFF; box-shadow: 0 0 12px #FF003C33; }
.target-card:hover .tc-code { color: #FF003C; }
.tc-label { font-size: 9px; color: #333; letter-spacing: 3px; margin-bottom: 6px; }
.tc-name { font-size: 13px; color: #FFFFFF; font-weight: 700; margin-bottom: 4px; }
.tc-code { font-size: 10px; color: #444; transition: color .15s; }
.tc-sys { font-size: 9px; color: #333; margin-top: 6px; letter-spacing: 1px; }

@keyframes scan { 0%{top:5%} 100%{top:95%} }
@keyframes flicker { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes pulsebtn { 0%,100%{box-shadow:0 0 8px #00F0FF44} 50%{box-shadow:0 0 20px #00F0FF,0 0 40px #00F0FF33} }
@keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes alertPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes glitch {
  0%{transform:translate(0)}
  10%{transform:translate(-4px,2px);filter:hue-rotate(90deg)}
  20%{transform:translate(4px,-2px);filter:hue-rotate(-90deg)}
  30%{transform:translate(-2px,0);clip-path:inset(30% 0 40% 0)}
  40%{transform:translate(2px,1px);filter:none;clip-path:none}
  100%{transform:translate(0)}
}
`;