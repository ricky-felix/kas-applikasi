"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Material } from "@/lib/data";
import { useMaterials } from "@/lib/stores";
import { Kicker, DisplayHeading } from "@/components/primitives";

type ModalState = "none" | "add" | "refill";

const UNITS = ["kg", "ltr", "pcs", "m²", "m", "set", "roll", "sak"];

export function MaterialTab() {
  const MATERIALS = useMaterials();
  const SUPPLIERS = useMemo(() => Array.from(new Set(MATERIALS.map((m) => m.supplier))), [MATERIALS]);
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  // Seed local editable state from live materials once they hydrate.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && MATERIALS.length > 0) {
      setMaterials(MATERIALS);
      seeded.current = true;
    }
  }, [MATERIALS]);
  const [modal, setModal]         = useState<ModalState>("none");

  // Add new material form
  const [newName,        setNewName]        = useState("");
  const [newUnit,        setNewUnit]        = useState("kg");
  const [newSupplier,    setNewSupplier]    = useState(SUPPLIERS[0] ?? "");
  const [newSupplierNew, setNewSupplierNew] = useState("");
  const [newPrice,       setNewPrice]       = useState("");
  const [newMin,         setNewMin]         = useState("");
  const [newBudget,      setNewBudget]      = useState("");

  // Refill form
  const [refillId,  setRefillId]  = useState(materials[0]?.id ?? "");
  const [refillQty, setRefillQty] = useState("");

  const lowCount = materials.filter((m) => m.stock <= m.minStock).length;

  const resolvedSupplier = newSupplier === "__new__" ? newSupplierNew.trim() : newSupplier;

  const closeModal = () => {
    setModal("none");
    setNewName(""); setNewUnit("kg"); setNewSupplier(SUPPLIERS[0] ?? "");
    setNewSupplierNew(""); setNewPrice(""); setNewMin(""); setNewBudget("");
    setRefillQty("");
  };

  const handleAdd = () => {
    if (!newName.trim() || !resolvedSupplier || !newPrice || !newMin || !newBudget) return;
    const id = `m${Date.now()}`;
    setMaterials((prev) => [...prev, {
      id,
      name:      newName.trim(),
      unit:      newUnit,
      unitPrice: Number(newPrice),
      supplier:  resolvedSupplier,
      stock:     0,
      minStock:  Number(newMin),
      budget:    Number(newBudget),
      used:      0,
    }]);
    closeModal();
  };

  const handleRefill = () => {
    const qty = Number(refillQty);
    if (!refillId || !qty || qty <= 0) return;
    setMaterials((prev) =>
      prev.map((m) => m.id === refillId ? { ...m, stock: m.stock + qty } : m)
    );
    closeModal();
  };

  const addReady    = newName.trim() && resolvedSupplier && newPrice && newMin && newBudget;
  const refillReady = refillId && refillQty && Number(refillQty) > 0;

  return (
    <>
      <div className="flex justify-between items-end mb-1">
        <Kicker no="C" label={`${materials.length} ITEM MATERIAL`} />
        {lowCount > 0 && (
          <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", padding: "3px 8px", background: "var(--kas-rust-soft)", color: "var(--kas-rust-ink)" }}>
            {lowCount} stok tipis
          </span>
        )}
      </div>
      <DisplayHeading size={26}>Material,<br /><em>stok gudang.</em></DisplayHeading>

      {/* Action buttons */}
      <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button
          type="button"
          onClick={() => setModal("add")}
          style={{ border: "1px solid var(--kas-ink)", background: "var(--kas-ink)", color: "var(--kas-paper)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
        >
          + Produk Baru
        </button>
        <button
          type="button"
          onClick={() => setModal("refill")}
          style={{ border: "1px solid var(--kas-ink)", background: "transparent", color: "var(--kas-ink)", padding: "10px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Isi Ulang Stok
        </button>
      </div>

      <div className="mt-4" style={{ borderTop: "1px solid var(--kas-ink)" }}>
        {materials.map((m) => {
          const low = m.stock <= m.minStock;
          const pct = Math.round((m.used / m.budget) * 100);
          return (
            <div key={m.id} className="py-3.5" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 16, lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 2, letterSpacing: "0.1em" }}>{m.supplier}</div>
                </div>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "3px 8px", background: low ? "var(--kas-rust-soft)" : "var(--kas-moss-soft)", color: low ? "var(--kas-rust-ink)" : "var(--kas-moss-ink)" }}>
                  {low ? "Tipis" : "Aman"}
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Stok Gudang</div>
                  <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 500, color: low ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                    {m.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--kas-ink-3)" }}>{m.unit}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", marginTop: 1 }}>Min. {m.minStock} {m.unit}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Terpakai / Budget</div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: pct >= 90 ? "var(--kas-rust)" : "var(--kas-ink)" }}>{m.used}</span>
                    <span style={{ color: "var(--kas-ink-3)" }}> / {m.budget} {m.unit}</span>
                  </div>
                  <div className="relative" style={{ height: 3, background: "var(--kas-line-2)" }}>
                    <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? "var(--kas-rust)" : "var(--kas-cobalt)" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new product modal */}
      {modal === "add" && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(22,28,44,0.5)" }} onClick={closeModal}>
          <div className="w-full" style={{ background: "var(--kas-paper)", borderTop: "2px solid var(--kas-ink)", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-2 flex justify-between items-center" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 2 }}>Tambah</div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>Produk baru.</div>
              </div>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", color: "var(--kas-ink-3)", lineHeight: 1, padding: "0 0 4px" }}>×</button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Nama */}
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  Nama Material <span style={{ color: "var(--kas-rust)" }}>*</span>
                </div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Sika Top Seal-107"
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Satuan + Supplier */}
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                    Satuan <span style={{ color: "var(--kas-rust)" }}>*</span>
                  </div>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 8px", outline: "none", cursor: "pointer" }}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                    Harga Satuan (Rp) <span style={{ color: "var(--kas-rust)" }}>*</span>
                  </div>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="45000"
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 8px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  Supplier <span style={{ color: "var(--kas-rust)" }}>*</span>
                </div>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", cursor: "pointer" }}
                >
                  {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="__new__">+ Supplier baru...</option>
                </select>
                {newSupplier === "__new__" && (
                  <input
                    type="text"
                    value={newSupplierNew}
                    onChange={(e) => setNewSupplierNew(e.target.value)}
                    placeholder="Nama supplier baru"
                    autoFocus
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", borderTop: "none", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>

              {/* Min stok + Budget */}
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                    Min. Stok <span style={{ color: "var(--kas-rust)" }}>*</span>
                  </div>
                  <input
                    type="number"
                    value={newMin}
                    onChange={(e) => setNewMin(e.target.value)}
                    placeholder="20"
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 8px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                    Budget Total <span style={{ color: "var(--kas-rust)" }}>*</span>
                  </div>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="120"
                    style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 8px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 pb-8 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid var(--kas-line)", background: "transparent", color: "var(--kas-ink-3)", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!addReady}
                style={{ border: "none", background: addReady ? "var(--kas-ink)" : "var(--kas-line)", color: "var(--kas-paper)", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: addReady ? "pointer" : "not-allowed" }}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refill stock modal */}
      {modal === "refill" && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(22,28,44,0.5)" }} onClick={closeModal}>
          <div className="w-full" style={{ background: "var(--kas-paper)", borderTop: "2px solid var(--kas-ink)" }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-2 flex justify-between items-center" style={{ borderBottom: "1px solid var(--kas-line)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 2 }}>Stok Masuk</div>
                <div style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em" }}>Isi ulang.</div>
              </div>
              <button type="button" onClick={closeModal} style={{ border: "none", background: "transparent", fontFamily: "var(--font-newsreader), serif", fontSize: 24, cursor: "pointer", color: "var(--kas-ink-3)", lineHeight: 1, padding: "0 0 4px" }}>×</button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>Material</div>
                <select
                  value={refillId}
                  onChange={(e) => setRefillId(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, padding: "10px 12px", outline: "none", cursor: "pointer" }}
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Current stock info */}
              {refillId && (() => {
                const m = materials.find((x) => x.id === refillId);
                if (!m) return null;
                return (
                  <div className="px-3 py-2.5 flex justify-between items-center" style={{ background: "var(--kas-paper-2)", border: "1px solid var(--kas-line)" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "var(--kas-ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Stok saat ini</span>
                    <span style={{ fontFamily: "var(--font-newsreader), serif", fontSize: 18, color: m.stock <= m.minStock ? "var(--kas-rust)" : "var(--kas-ink)" }}>
                      {m.stock} <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>{m.unit}</span>
                    </span>
                  </div>
                );
              })()}

              <div>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--kas-ink-3)", marginBottom: 4 }}>
                  Jumlah Masuk ({materials.find((m) => m.id === refillId)?.unit ?? "—"}) <span style={{ color: "var(--kas-rust)" }}>*</span>
                </div>
                <input
                  type="number"
                  value={refillQty}
                  onChange={(e) => setRefillQty(e.target.value)}
                  placeholder="0"
                  style={{ width: "100%", border: "1px solid var(--kas-ink)", background: "var(--kas-paper-2)", fontFamily: "var(--font-jetbrains), monospace", fontSize: 22, padding: "10px 12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className="px-5 pb-8 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid var(--kas-line)", background: "transparent", color: "var(--kas-ink-3)", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Batal</button>
              <button
                type="button"
                onClick={handleRefill}
                disabled={!refillReady}
                style={{ border: "none", background: refillReady ? "var(--kas-ink)" : "var(--kas-line)", color: "var(--kas-paper)", padding: "12px 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: refillReady ? "pointer" : "not-allowed" }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
