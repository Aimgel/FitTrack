export default function MacroRing({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 26;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <svg width="64" height="64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1a1a2a" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r}
          fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
        <text
          x="32" y="36"
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="700"
          fontFamily="'DM Mono', monospace"
        >
          {Math.round(value)}g
        </text>
      </svg>
      <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
    </div>
  );
}
