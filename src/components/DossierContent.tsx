"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";

// ─── Ease Curves ──────────────────────────────────────────────────────────────
const EASE_HEAVY: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];

// ─── Data ─────────────────────────────────────────────────────────────────────

const DECRYPT_LINES = [
  "INICIANDO PROTOCOLO DE CONEXIÓN SEGURA...",
  "VERIFICANDO FIRMA RSA-4096...",
  "ESTABLECIENDO CANAL CIFRADO AES-256...",
  "AUTENTICANDO CREDENCIALES BIOMÉTRICAS...",
  "VERIFICANDO CLEARANCE: NIVEL Ω...",
  "DESCOMPRIMIENDO ARCHIVO REF_DOC_401...",
  "ACCESO CONCEDIDO.",
];

const ARCHIVES = [
  {
    id: "01",
    tag: "ORIGEN",
    authors: "Jinek et al. (2012) / Cong et al. (2013)",
    title: "Fundamento Estructural: CRISPR-Cas9 como Endonucleasa Programable",
    desc: "Demostración del complejo ARN-proteína Cas9 como herramienta de corte de doble cadena. Primera edición exitosa del genoma eucariota. Hito fundacional.",
    classif: "SEMINAL",
    hash: "SHA-256::a3f4b9c1",
    doi: "10.1126/science.1225829",
    risk: "BAJO",
  },
  {
    id: "02",
    tag: "APLICACIÓN CLÍNICA",
    authors: "Frangoul et al. (2021) / MHRA (2023)",
    title: "Terapia Casgevy: Anemia Falciforme y β-Talasemia",
    desc: "Primera aprobación regulatoria global (MHRA). Eliminación completa de crisis vaso-oclusivas en cohorte de seguimiento. Reducción de transfusiones: 100% en pacientes tratados.",
    classif: "VALIDADO",
    hash: "SHA-256::d7e2a0f5",
    doi: "10.1056/NEJMoa2031054",
    risk: "MODERADO",
  },
  {
    id: "03",
    tag: "RIESGOS DOCUMENTADOS",
    authors: "Guo et al. (2023)",
    title: "Off-Target Effects y Reordenamientos Cromosómicos",
    desc: "Análisis sistemático de efectos fuera del objetivo. Detección de translocaciones cromosómicas en células somáticas post-edición. Vectores de riesgo no despreciables.",
    classif: "RESTRINGIDO",
    hash: "SHA-256::f1c8d3b7",
    doi: "10.3389/fbioe.2023.1143157",
    risk: "ALTO",
  },
  {
    id: "04",
    tag: "VECTOR FUTURO",
    authors: "Anzalone et al. (2019)",
    title: "Prime Editing: Reescritura sin Corte de Doble Cadena",
    desc: "Paradigma de edición de siguiente generación. Sustituciones, inserciones y deleciones sin DSB. Reducción teórica de riesgo oncogénico en un 87%. Estado: Ensayo Clínico Fase I.",
    classif: "EXPERIMENTAL",
    hash: "SHA-256::2b9e7a4c",
    doi: "10.1038/s41586-019-1711-4",
    risk: "BAJO",
  },
  {
    id: "05",
    tag: "BIOÉTICA / CASO REAL",
    authors: "Cyranoski & Ledford (2018)",
    title: "Embriones Editados VIH-Resistentes: El Caso He Jiankui",
    desc: "Nacimiento documentado de embriones humanos editados para resistencia al VIH (gen CCR5). Violación de moratoria internacional. Catalizador de marcos de gobernanza global.",
    classif: "CRÍTICO",
    hash: "SHA-256::9c3f1d8e",
    doi: "10.1038/d41586-018-07607-3",
    risk: "CRÍTICO",
  },
];

const TEAM = [
  { id: "NODE_01", name: "Judith Rene Dorame Álvarez", role: "INVESTIGADORA PRINCIPAL", clearance: "OMEGA" },
  { id: "NODE_02", name: "Aleshka Aracely Prieto Acosta", role: "ANALISTA GENÓMICA", clearance: "OMEGA" },
  { id: "NODE_03", name: "Andy David Tarango Calderon", role: "ARQUITECTO DE SISTEMAS", clearance: "OMEGA" },
];

const RISK_COLOR: Record<string, string> = {
  BAJO: "#ffffff44",
  MODERADO: "#ffffff88",
  ALTO: "#FF003C",
  CRÍTICO: "#FF003C",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1200, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

// ─── Decrypt Intro ────────────────────────────────────────────────────────────

function DecryptIntro({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const push = () => {
      if (i >= DECRYPT_LINES.length) {
        setTimeout(() => setDone(true), 480);
        return;
      }
      setLines((p) => [...p, DECRYPT_LINES[i]]);
      i++;
      setTimeout(push, i === DECRYPT_LINES.length - 1 ? 360 : 260);
    };
    setTimeout(push, 300);
  }, []);

  useEffect(() => {
    if (done) setTimeout(onDone, 600);
  }, [done]);

  return (
    <motion.div
      className="decrypt-overlay"
      initial={{ y: 0 }}
      animate={done ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 1.1, ease: EASE_HEAVY }}
    >
      <div className="decrypt-inner">
        <div className="decrypt-header">
          <span className="mono-xs text-zinc-600">BIOFORGE // TERMINAL v4.1.7</span>
          <span className="mono-xs text-zinc-600">▓▓▓▒▒░░</span>
        </div>
        <div className="decrypt-lines">
          <AnimatePresence>
            {lines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "linear" }}
                className={`decrypt-line ${idx === lines.length - 1 && done ? "done" : ""}`}
              >
                <span className="decrypt-prompt">›</span>
                <span>{line}</span>
                {idx === lines.length - 1 && <span className="decrypt-cursor">█</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="decrypt-granted"
          >
            ■ ACCESO CONCEDIDO ■
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Scanline ticker ──────────────────────────────────────────────────────────

function Ticker() {
  const items = [
    "REF_DOC_401", "CLASIFICADO NIVEL Ω", "CRISPR-CAS9 // PROTOCOLO ΔΨ",
    "BIOFORGE LAB", "UTCH // UNIDAD BIS", "DATA INTEGRITY: VERIFIED",
    "TIMESTAMP: " + new Date().toISOString().slice(0, 19).replace("T", " "),
  ];
  const str = items.join("  ///  ") + "  ///  " + items.join("  ///  ");
  return (
    <div className="ticker-wrap" aria-hidden>
      <div className="ticker-track">
        <span>{str}</span>
        <span>{str}</span>
      </div>
    </div>
  );
}

// ─── Barcode SVG ──────────────────────────────────────────────────────────────

function Barcode() {
  const bars: { w: number; x: number }[] = [];
  const widths = [1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 2, 3, 1];
  let x = 0;
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ w, x });
    x += w + 1;
  });
  const total = x;
  return (
    <svg viewBox={`0 0 ${total} 48`} width={total * 2} height={48} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={48} fill="white" opacity={0.15 + (i % 3) * 0.1} />
      ))}
    </svg>
  );
}

// ─── Archive Row ──────────────────────────────────────────────────────────────

function ArchiveRow({ archive, index }: { archive: typeof ARCHIVES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE_HEAVY, delay: index * 0.08 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      className={`archive-row ${hov ? "hov" : ""}`}
    >
      {/* Left: ID + tag */}
      <div className="archive-id-col">
        <span className="archive-num">_{archive.id}</span>
        <span className="archive-tag">{archive.tag}</span>
      </div>

      {/* Center: content */}
      <div className="archive-content">
        <div className="archive-authors">{archive.authors}</div>
        <div className="archive-title">{archive.title}</div>
        <div className="archive-desc">{archive.desc}</div>
        <div className="archive-meta">
          {/* Aquí se integra el enlace real al documento clínico */}
          <a
            href={`https://doi.org/${archive.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Previene que el clic active otras cosas en la fila
            style={{
              color: hov ? "#FF003C" : "#a1a1aa",
              textDecoration: "underline",
              textDecorationStyle: "dashed",
              textUnderlineOffset: "4px",
              fontWeight: hov ? 700 : 400,
              transition: "all 0.2s ease-in-out",
              cursor: "pointer",
            }}
          >
            [ OPEN SOURCE: {archive.doi} ↗ ]
          </a>
          <span className="meta-sep">///</span>
          <span>{archive.hash}</span>
        </div>
      </div>

      {/* Right: badges */}
      <div className="archive-badges">
        <span className="badge-classif">{archive.classif}</span>
        <span
          className="badge-risk"
          style={{ color: hov ? "#000" : RISK_COLOR[archive.risk], borderColor: hov ? "#000" : RISK_COLOR[archive.risk] }}
        >
          RIESGO: {archive.risk}
        </span>
      </div>

      {/* Hover fill */}
      <motion.div
        className="archive-hover-fill"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hov ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE_SHARP }}
      />
    </motion.div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatBlock({ value, label, suffix = "", active }: { value: number; label: string; suffix?: string; active: boolean }) {
  const count = useCounter(value, 1400, active);
  return (
    <div className="stat-block">
      <div className="stat-value">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Team Node ────────────────────────────────────────────────────────────────

function TeamNode({ member, index }: { member: typeof TEAM[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE_HEAVY, delay: index * 0.1 }}
      className="team-node"
    >
      <div className="team-node-id">{member.id}</div>
      <div className="team-node-name">{member.name}</div>
      <div className="team-node-role">{member.role}</div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DossierContent() {
  const [ready, setReady] = useState(false);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 400], [0, -60]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <>
      <AnimatePresence>{!ready && <DecryptIntro onDone={() => setReady(true)} />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: "linear" }}
        className="dossier-root"
      >
        {/* ── Ticker ── */}
        <Ticker />

        {/* ── Header ── */}
        <motion.header
          style={{ y: headerY, opacity: headerOpacity }}
          className="dossier-header"
        >
          <div className="header-meta">
            <div className="header-ref">
              <span className="mono-xs text-zinc-600">REF_DOC_401</span>
              <span className="mono-xs text-zinc-800">///</span>
              <span className="mono-xs text-zinc-600">PROTOCOLO ΔΨ</span>
            </div>
            <div className="header-status">
              <motion.span
                className="status-pill"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              >
                ● CLASIFICADO — LECTURA ÚNICA
              </motion.span>
            </div>
          </div>

          <div className="header-title-area">
            <motion.div
              className="header-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: EASE_HEAVY, delay: 0.2 }}
            >
              DOSSIER CLÍNICO
            </motion.div>
            <motion.h1
              className="header-h1"
              initial={{ opacity: 0, y: 28 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.1, ease: EASE_HEAVY, delay: 0.35 }}
            >
              CRISPR
              <br />
              <span className="h1-cas">— Cas9</span>
            </motion.h1>
            <motion.p
              className="header-sub"
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE_HEAVY, delay: 0.7 }}
            >
              Sistema de edición genómica de precisión. Clasificación: Biotecnología Terapéutica.<br />
              Riesgo sistémico: En evaluación. Potencial transformador: Absoluto.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            ref={statsRef}
            className="stats-row"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE_HEAVY, delay: 0.85 }}
          >
            <StatBlock value={12} label="AÑOS DE INVESTIGACIÓN ACTIVA" suffix="+" active={statsInView} />
            <div className="stats-sep" />
            <StatBlock value={5} label="ARCHIVOS CLASIFICADOS" active={statsInView} />
            <div className="stats-sep" />
            <StatBlock value={99} label="PRECISIÓN GENÓMICA HDR" suffix="%" active={statsInView} />
            <div className="stats-sep" />
            <StatBlock value={3} label="OPERADORES AUTORIZADOS" active={statsInView} />
          </motion.div>
        </motion.header>

        {/* ── Divider ── */}
        <div className="section-divider">
          <span className="mono-xs text-zinc-700">BLOQUE 01</span>
          <div className="divider-line" />
          <span className="mono-xs text-zinc-700">EXPEDIENTES ACADÉMICOS // CLASIFICADOS</span>
        </div>

        {/* ── Archives ── */}
        <section className="archives-section">
          <div className="archives-header-row">
            <span className="col-label">ID / CATEGORÍA</span>
            <span className="col-label">ARCHIVO CLÍNICO</span>
            <span className="col-label" style={{ textAlign: "right" }}>ESTADO</span>
          </div>
          <div className="archives-list">
            {ARCHIVES.map((a, i) => (
              <ArchiveRow key={a.id} archive={a} index={i} />
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="section-divider" style={{ marginTop: "6rem" }}>
          <span className="mono-xs text-zinc-700">BLOQUE 02</span>
          <div className="divider-line" />
          <span className="mono-xs text-zinc-700">NODOS DE INVESTIGACIÓN // OPERADORES</span>
        </div>

        {/* ── Team ── */}
        <section className="team-section">
          <div className="team-institution">
            <div className="institution-seal w-12 h-12">
              <img src="./bis.png" alt="utch" className="w-12 h-12" />

            </div>
            {/* <div className="institution-seal">
              <div className="seal-ring">
                <span className="seal-text">UTCH</span>
              </div>
            </div> */}
            <div className="institution-info">
              <div className="mono-xs text-zinc-600" style={{ marginBottom: "0.5rem" }}>INSTITUCIÓN EMISORA</div>
              <div className="institution-name">Universidad Tecnológica de Chihuahua</div>
              <div className="institution-unit">Unidad Académica BIS</div>
              <div className="mono-xs text-zinc-700" style={{ marginTop: "0.75rem" }}>
                
              </div>
            </div>
          </div>

          <div className="team-grid">
            {TEAM.map((m, i) => <TeamNode key={m.id} member={m} index={i} />)}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="dossier-footer">
          <div className="footer-barcode">
            <Barcode />
          </div>
          <div className="footer-meta">
            <span className="mono-xs text-zinc-600">REF_DOC_401 // CRISPR-CAS9 DOSSIER CLÍNICO</span>
            <span className="mono-xs text-zinc-600">∎ END OF FILE. // DATA DESTRUCT SEQUENCE INITIATED.</span>
            <span className="mono-xs text-zinc-600">UTCH // BIS // {new Date().getFullYear()}</span>
          </div>
        </footer>
      </motion.div>
    </>
  );
}