"use client";
import { useState } from "react";
import { PROJECTS, MATERIALS } from "@/lib/data";
import { Kicker, DisplayHeading, MonoLabel } from "@/components/primitives";

type InventoryItem = { materialId: string; name: string; unit: string; qty: number };
type ProjectInventory = Record<string, InventoryItem[]>;

const INITIAL_INVENTORY: ProjectInventory = {
  p1: [
    { materialId: "m1", name: "Sika Top Seal-107",  unit: "kg",  qty: 20 },
    { materialId: "m3", name: "Kuas Roll 9\"",      unit: "pcs", qty: 4  },
    { materialId: "m5", name: "Sika Latex",         unit: "ltr", qty: 8  },
  ],
  p2: [
    { materialId: "m2", name: "Aquaproof Original", unit: "kg",  qty: 10 },
    { materialId: "m4", name: "Primer Coat",        unit: "ltr", qty: 5  },
    { materialId: "m6", name: "Net Fiber Glass",    unit: "m²",  qty: 30 },
  ],
};

export default function MaterialTab({
  myProjects,
  isKepalaProyek,
  toast,
}: {
  myProjects: typeof PROJECTS;
  isKepalaProyek: boolean;
  toast: (m: string) => void;
}) {
  const [projId, setProjId]           = useState(myProjects[0]?.id || "");
  const [inventory, setInventory]     = useState<ProjectInventory>(INITIAL_INVENTORY);
  const [pakaiId, setPakaiId]         = useState<string | null>(null);
  const [pakaiQty, setPakaiQty]       = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [addMatId, setAddMatId]       = useState("");
  const [addQty, setAddQty]           = useState("");

  const proj      = myProjects.find((p) => p.id === projId) || myProjects[0];
  const items     = inventory[projId] ?? [];
  const globalMat = MATERIALS.find((m) => m.id === addMatId);

  // ── Pakai (decrease) ────────────────────────────────────────────────────
  const handlePakai = (item: InventoryItem) => {
    const n = Number(pakaiQty);
    if (!n || n <= 0)             { toast("Masukkan jumlah yang valid."); return; }
    if (n > item.qty)             { toast(`Stok hanya ${item.qty} ${item.unit}.`); return; }
    setInventory((prev) => ({
      ...prev,
      [projId]: prev[projId].map((i) =>
        i.materialId === item.materialId ? { ...i, qty: i.qty - n } : i
      ),
    }));
    toast(`${item.name} −${n} ${item.unit}.`);
    setPakaiId(null);
    setPakaiQty("");
  };

  // ── Add material to project ──────────────────────────────────────────────
  const handleAdd = () => {
    const n = Number(addQty);
    if (!addMatId || !n || n <= 0) { toast("Pilih material dan jumlah."); return; }
    const mat = MATERIALS.find((m) => m.id === addMatId)!;
    if (n > mat.stock)             { toast(`Stok gudang hanya ${mat.stock} ${mat.unit}.`); return; }
    setInventory((prev) => {
      const existing = (prev[projId] ?? []).find((i) => i.materialId === addMatId);
      const updated  = existing
        ? (prev[projId] ?? []).map((i) => i.materialId === addMatId ? { ...i, qty: i.qty + n } : i)
        : [...(prev[projId] ?? []), { materialId: mat.id, name: mat.name, unit: mat.unit, qty: n }];
      return { ...prev, [projId]: updated };
    });
    toast(`+${n} ${mat.unit} ${mat.name} ditambah ke proyek.`);
    setShowAdd(false);
    setAddMatId("");
    setAddQty("");
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <Kicker no="02" label="MATERIAL PROYEK" />
      <DisplayHeading size={28}>Material,<br /><em>di lokasi.</em></DisplayHeading>

      {/* Project selector */}
      {myProjects.length > 1 && (
        <div className="relative mt-4">
          <select
            value={projId}
            onChange={(e) => { setProjId(e.target.value); setPakaiId(null); setShowAdd(false); }}
            className="w-full appearance-none px-3 py-2.5 pr-8"
            style={{
              border: "1px solid var(--kas-ink)",
              background: "var(--kas-paper)",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--kas-ink)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {myProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.address}</option>
            ))}
          </select>
          <span
            className="absolute right-3 top-1/2 pointer-events-none"
            style={{ transform: "translateY(-50%)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)" }}
          >
            ▾
          </span>
        </div>
      )}

      {/* ── Inventory list ────────────────────────────────────────────────── */}
      <div className="mt-5" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {items.length === 0 ? (
          <div className="py-8 text-center" style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-4)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Belum ada material di lokasi
          </div>
        ) : items.map((item) => {
          const isPakai  = pakaiId === item.materialId;
          const isLow    = item.qty <= 3;
          return (
            <div key={item.materialId} style={{ borderBottom: "1px solid var(--kas-line)" }}>
              {/* Item row */}
              <div className="flex items-center justify-between py-3.5 gap-3">
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 17, lineHeight: 1.2 }}>{item.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 20, fontWeight: 500, lineHeight: 1, color: isLow ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                      {item.qty}
                    </span>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em" }}>
                      {item.unit.toUpperCase()}
                    </span>
                    {isLow && (
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, color: "var(--kas-rust)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        · HAMPIR HABIS
                      </span>
                    )}
                  </div>
                </div>

                {isKepalaProyek && (
                  <button
                    type="button"
                    onClick={() => { setPakaiId(isPakai ? null : item.materialId); setPakaiQty(""); setShowAdd(false); }}
                    style={{
                      border: `1px solid ${isPakai ? "var(--kas-ink)" : "var(--kas-line)"}`,
                      background: isPakai ? "var(--kas-ink)" : "var(--kas-paper)",
                      color:      isPakai ? "var(--kas-paper)" : "var(--kas-ink-3)",
                      padding: "7px 14px",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    {isPakai ? "Batal" : "− Pakai"}
                  </button>
                )}
              </div>

              {/* Inline pakai form */}
              {isPakai && (
                <div className="pb-3 flex gap-2 items-center">
                  <input
                    type="number"
                    autoFocus
                    value={pakaiQty}
                    onChange={(e) => setPakaiQty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePakai(item); }}
                    placeholder={`Jumlah (maks ${item.qty} ${item.unit})`}
                    className="flex-1 px-3 py-2.5"
                    style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePakai(item)}
                    style={{
                      border: "none",
                      background: pakaiQty && Number(pakaiQty) > 0 ? "var(--kas-ink)" : "var(--kas-line)",
                      color: pakaiQty && Number(pakaiQty) > 0 ? "var(--kas-paper)" : "var(--kas-ink-3)",
                      padding: "10px 16px",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                      cursor: pakaiQty && Number(pakaiQty) > 0 ? "pointer" : "default",
                    }}
                  >
                    Konfirmasi
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add material (Team Leader only) ────────────────────────────── */}
      {isKepalaProyek && (
        <div className="mt-4">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => { setShowAdd(true); setPakaiId(null); }}
              className="w-full flex items-center justify-center gap-2 py-3.5"
              style={{ border: "1px dashed var(--kas-ink)", background: "var(--kas-paper)", cursor: "pointer", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}
            >
              <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, lineHeight: 0.8 }}>+</span>
              Tambah Material ke Proyek
            </button>
          ) : (
            <div style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)" }}>
              <div className="px-4 pt-4 pb-2">
                <MonoLabel size={9}>PILIH DARI GUDANG</MonoLabel>
              </div>

              {/* Global material list */}
              <div style={{ borderTop: "1px solid var(--kas-line)", maxHeight: 260, overflowY: "auto" }}>
                {MATERIALS.map((m) => {
                  const sel = addMatId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setAddMatId(m.id); setAddQty(""); }}
                      className="w-full flex items-center justify-between px-4 py-3"
                      style={{
                        border: "none",
                        borderBottom: "1px solid var(--kas-line-2)",
                        background: sel ? "var(--kas-ink)" : "transparent",
                        color:      sel ? "var(--kas-paper)" : "var(--kas-ink)",
                        cursor: m.stock === 0 ? "not-allowed" : "pointer",
                        opacity: m.stock === 0 ? 0.4 : 1,
                        textAlign: "left",
                      }}
                      disabled={m.stock === 0}
                    >
                      <div>
                        <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 15 }}>{m.name}</div>
                        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.1em", marginTop: 2, opacity: sel ? 0.6 : 1, color: sel ? "inherit" : m.stock <= m.minStock ? "var(--kas-rust)" : "var(--kas-ink-3)" }}>
                          Gudang: {m.stock} {m.unit}{m.stock <= m.minStock ? " · TIPIS" : ""}
                        </div>
                      </div>
                      {sel && <span style={{ fontSize: 14 }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Quantity input */}
              {globalMat && (
                <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid var(--kas-line)" }}>
                  <input
                    type="number"
                    autoFocus
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                    placeholder={`Jumlah (${globalMat.unit})`}
                    className="flex-1 px-3 py-2.5"
                    style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-paper)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    style={{
                      border: "none",
                      background: addQty && Number(addQty) > 0 ? "var(--kas-ink)" : "var(--kas-line)",
                      color: addQty && Number(addQty) > 0 ? "var(--kas-paper)" : "var(--kas-ink-3)",
                      padding: "10px 16px",
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                      cursor: addQty && Number(addQty) > 0 ? "pointer" : "default",
                    }}
                  >
                    Tambah
                  </button>
                </div>
              )}

              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddMatId(""); setAddQty(""); }}
                  style={{ border: "none", background: "transparent", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--kas-ink-3)", cursor: "pointer", padding: 0 }}
                >
                  ← Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {proj && (
        <div className="mt-6 px-3 py-2.5" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--kas-ink-3)", textTransform: "uppercase", marginBottom: 3 }}>
            Inventaris di lokasi
          </div>
          <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.06em" }}>
            {proj.code} · {items.length} jenis material · {items.reduce((s, i) => s + i.qty, 0)} total unit
          </div>
        </div>
      )}
    </div>
  );
}
