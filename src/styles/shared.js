export const S = {
  input: {
    width: "100%",
    background: "#0c0c14",
    border: "1px solid #1c1c2c",
    borderRadius: 7,
    padding: "9px 12px",
    color: "#ddd",
    fontSize: 13,
    fontFamily: "'Barlow', sans-serif",
    outline: "none",
  },
  inputSm: {
    background: "#0c0c14",
    border: "1px solid #1c1c2c",
    borderRadius: 6,
    padding: "7px 4px",
    color: "#ddd",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    width: "100%",
    textAlign: "center",
  },
  iconBtn: {
    background: "transparent",
    border: "1px solid #1c1c2c",
    borderRadius: 5,
    color: "#444",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  redBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#e63946",
    border: "none",
    borderRadius: 7,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  ghostBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px solid #2a2a3a",
    borderRadius: 7,
    color: "#555",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
};

export const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #060608; color: #ccc; font-family: 'Barlow', sans-serif; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input::placeholder { color: #252535; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: #1c1c2c; border-radius: 2px; }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;