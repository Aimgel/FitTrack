import { useState } from "react";
import { EXERCISE_PRESETS } from "../data/presets";
import { S } from "../styles/shared";
import { PlusIco, TrashIco, CloseIco, CheckIco } from "./Icons";

export default function DayModal({ day, dayData, onClose, onSave }) {
  const [exercises, setExercises] = useState(() =>
    (dayData?.exercises || []).map((e) =>
      typeof e === "string"
        ? { id: Date.now() + Math.random(), name: e, sets: [{ reps: "", weight: "" }] }
        : { ...e, sets: e.sets?.length ? e.sets : [{ reps: "", weight: "" }] }
    )
  );
  const [search, setSearch] = useState("");
  const [showSug, setShowSug] = useState(false);

  const filtered = EXERCISE_PRESETS.filter(
    (e) => e.toLowerCase().includes(search.toLowerCase()) && search.length > 0
  ).slice(0, 6);

  const color = dayData?.splitColor || "#e63946";

  const addEx = (name) => {
    setExercises((p) => [...p, { id: Date.now(), name, sets: [{ reps: "", weight: "" }] }]);
    setSearch("");
    setShowSug(false);
  };
  const addSet = (id) =>
    setExercises((p) =>
      p.map((e) => (e.id === id ? { ...e, sets: [...e.sets, { reps: "", weight: "" }] } : e))
    );
  const updSet = (id, si, field, val) =>
    setExercises((p) =>
      p.map((e) =>
        e.id === id ? { ...e, sets: e.sets.map((s, i) => (i === si ? { ...s, [field]: val } : s)) } : e
      )
    );
  const rmEx  = (id) => setExercises((p) => p.filter((e) => e.id !== id));
  const rmSet = (id, si) =>
    setExercises((p) =>
      p.map((e) => (e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e))
    );

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(6px)" }}
    >
      <div style={{ width: "100%", maxWidth: 540, background: "#08080f",
        border: "1px solid #1c1c2c", borderRadius: "14px 14px 0 0",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        animation: "slideUp 0.22s ease" }}>

        {/* Header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #111120",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {day}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22,
              fontWeight: 800, color: "#fff", textTransform: "uppercase",
              letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 7 }}>
              {dayData?.label || "Workout"}
              <span style={{ width: 7, height: 7, background: color, borderRadius: "50%", display: "inline-block" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => onSave(exercises)} style={S.redBtn}>
              <CheckIco /> Save
            </button>
            <button onClick={onClose} style={{ ...S.iconBtn, padding: 8 }}>
              <CloseIco />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "14px 16px", flex: 1 }}>

          {/* Search / Add */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 7 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowSug(true); }}
                  onFocus={() => setShowSug(true)}
                  placeholder="Search or type exercise…"
                  style={S.input}
                />
                {showSug && filtered.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                    background: "#0c0c14", border: "1px solid #1c1c2c",
                    borderRadius: 8, zIndex: 50, overflow: "hidden" }}>
                    {filtered.map((e) => (
                      <button key={e} onMouseDown={() => addEx(e)}
                        style={{ display: "block", width: "100%", padding: "9px 13px",
                          background: "transparent", border: "none", color: "#ccc",
                          fontSize: 13, cursor: "pointer", borderBottom: "1px solid #111120",
                          fontFamily: "inherit", textAlign: "left" }}
                        onMouseEnter={(ev) => (ev.target.style.background = "#111120")}
                        onMouseLeave={(ev) => (ev.target.style.background = "transparent")}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { if (search.trim()) addEx(search.trim()); }} style={S.redBtn}>
                <PlusIco /> Add
              </button>
            </div>
          </div>

          {exercises.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#2a2a3a", fontSize: 13 }}>
              {dayData?.label === "Rest" ? "Rest day — add exercises to override" : "No exercises yet"}
            </div>
          )}

          {/* Exercise cards */}
          {exercises.map((ex) => (
            <div key={ex.id} style={{ background: "#0c0c14", border: "1px solid #1c1c2c",
              borderRadius: 9, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 13px", background: "#0f0f1a", borderBottom: "1px solid #1c1c2c" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{ex.name}</span>
                <button onClick={() => rmEx(ex.id)} style={S.iconBtn}><TrashIco /></button>
              </div>
              <div style={{ padding: "10px 13px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 24px",
                  gap: 6, marginBottom: 4 }}>
                  {["SET", "REPS", "LBS", ""].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, color: "#444", fontWeight: 700, letterSpacing: "0.1em" }}>{h}</div>
                  ))}
                </div>
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 24px",
                    gap: 6, marginBottom: 5, alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      {si + 1}
                    </div>
                    <input value={s.reps} onChange={(e) => updSet(ex.id, si, "reps", e.target.value)}
                      placeholder="—" type="number" style={S.inputSm} />
                    <input value={s.weight} onChange={(e) => updSet(ex.id, si, "weight", e.target.value)}
                      placeholder="—" type="number" style={S.inputSm} />
                    <button onClick={() => rmSet(ex.id, si)}
                      style={{ ...S.iconBtn, opacity: ex.sets.length > 1 ? 1 : 0.2 }}>
                      <TrashIco />
                    </button>
                  </div>
                ))}
                <button onClick={() => addSet(ex.id)} style={{ marginTop: 5, background: "transparent",
                  border: "1px dashed #1c1c2c", borderRadius: 6, color: "#3a3a4a",
                  fontSize: 11, padding: "5px 0", width: "100%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 4, fontFamily: "inherit" }}>
                  <PlusIco /> Add Set
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
