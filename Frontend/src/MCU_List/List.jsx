import { useState, useEffect, useCallback } from "react";

const PORT = 4000;
const URL = `http://localhost:${PORT}`;

const AVATAR_COLORS = [
  "#e23636", "#f5c518", "#2d9cdb", "#27ae60",
  "#e74c3c", "#8e44ad", "#d35400", "#16a085",
  "#c0392b", "#2980b9", "#f39c12", "#1abc9c",
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const List = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [realName, setRealName] = useState("");
  const [universe, setUniverse] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showDeleteModal) setShowDeleteModal(false);
        else if (showModal) { setShowModal(false); resetForm(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showDeleteModal]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${URL}/characters`);
      const data = await res.json();
      setPersons(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setRealName("");
    setUniverse("");
    setEditingId(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (person) => {
    setEditingId(person.id);
    setName(person.name);
    setRealName(person.realName || "");
    setUniverse(person.universe);
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Le nom est requis";
    if (!universe.trim()) errs.universe = "L'univers est requis";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const body = { name: name.trim(), realName: realName.trim(), universe: universe.trim() };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`${URL}/characters/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.error || "Erreur lors de la modification", "error");
          return;
        }
        const updated = await res.json();
        setPersons(persons.map((p) => (p.id === editingId ? updated : p)));
        showToast("Personnage modifié avec succès");
      } else {
        const res = await fetch(`${URL}/characters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.error || "Erreur lors de l'ajout", "error");
          return;
        }
        const created = await res.json();
        setPersons([...persons, created]);
        showToast("Personnage ajouté avec succès");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast("Erreur réseau", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${URL}/characters/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Erreur lors de la suppression", "error");
        return;
      }
      setPersons(persons.filter((p) => p.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      showToast("Personnage supprimé avec succès");
    } catch (err) {
      showToast("Erreur réseau", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.realName && p.realName.toLowerCase().includes(search.toLowerCase())) ||
      p.universe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a1a" }}>
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e23636 0%, #b71c1c 50%, #7f0000 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-extrabold tracking-tight" style={{ color: "#e23636" }}>MCU</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  MCU Characters
                </h1>
                <p className="text-sm text-white/60 hidden sm:block">
                  {persons.length} personnage{persons.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-transparent text-sm transition-all"
                />
              </div>
              <button
                onClick={openAddModal}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/25 whitespace-nowrap text-sm"
              >
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: "#16162a" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full" style={{ backgroundColor: "#2a2a40" }} />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: "#2a2a40" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#2a2a40" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl font-bold" style={{ backgroundColor: "rgba(226,54,54,0.12)", color: "#e23636" }}>MCU</div>
            <p className="text-xl font-medium mb-2" style={{ color: "#888" }}>
              {search ? "Aucun résultat pour votre recherche" : "Aucun personnage"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#555" }}>
              {search
                ? "Essayez un autre terme de recherche"
                : "Commencez par ajouter un personnage"}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#e23636" }}
              >
                Ajouter un personnage
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((person, index) => (
              <div
                key={person.id}
                className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-[#22223a] hover:border-[#e2363640] bg-[#16162a] hover:bg-[#1c1c34]"
                style={{
                  animation: `slide-up 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg"
                    style={{ backgroundColor: getAvatarColor(person.id) }}
                  >
                    {getInitials(person.name)}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-bold text-lg text-white truncate">{person.name}</h3>
                    {person.realName && (
                      <p className="text-sm truncate" style={{ color: "#888" }}>{person.realName}</p>
                    )}
                    <span
                      className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#aaa" }}
                    >
                      {person.universe}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ borderColor: "#22223a" }}
                >
                  <button
                    onClick={() => openEditModal(person)}
                    className="px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95 bg-white/5 text-[#ccc] hover:bg-[#f5c518] hover:text-black"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => { setDeleteId(person.id); setShowDeleteModal(true); }}
                    className="px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95 bg-white/5 text-[#ccc] hover:bg-[#e23636] hover:text-white"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm(); }}>
          <div
            className="rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border animate-fade-in"
            style={{ backgroundColor: "#16162a", borderColor: "#22223a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: editingId ? "#f5c518" : "#e23636" }}
              >
                {editingId ? "✎" : "+"}
              </div>
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Modifier" : "Ajouter"} un personnage
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#999" }}>Nom *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: "" })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all bg-[#0a0a1a] border ${errors.name ? "border-red-500" : "border-[#2a2a40]"} focus:ring-[#e23636]`}
                  placeholder="Ex: Iron Man"
                  autoFocus
                />
                {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#999" }}>Vrai nom</label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#e23636] transition-all bg-[#0a0a1a] border border-[#2a2a40]"
                  placeholder="Ex: Tony Stark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#999" }}>Univers *</label>
                <input
                  type="text"
                  value={universe}
                  onChange={(e) => { setUniverse(e.target.value); if (errors.universe) setErrors(prev => ({ ...prev, universe: "" })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all bg-[#0a0a1a] border ${errors.universe ? "border-red-500" : "border-[#2a2a40]"} focus:ring-[#e23636]`}
                  placeholder="Ex: Earth-616"
                />
                {errors.universe && <p className="text-red-400 text-xs mt-1 ml-1">{errors.universe}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#ccc" }}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: editingId ? "#f5c518" : "#e23636", color: editingId ? "#000" : "#fff" }}
              >
                {submitting ? "En cours..." : editingId ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-sm flex items-center gap-2.5 ${
              toast.type === "error"
                ? "bg-red-900/80 border-red-700/50 text-red-200"
                : "bg-green-900/80 border-green-700/50 text-green-200"
            }`}
          >
            <span className="text-base">{toast.type === "error" ? "✕" : "✓"}</span>
            {toast.message}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div
            className="rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border animate-fade-in text-center"
            style={{ backgroundColor: "#16162a", borderColor: "#22223a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(226,54,54,0.15)" }}>
              <span className="text-3xl font-bold" style={{ color: "#e23636" }}>!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h2>
            <p className="mb-6 text-sm" style={{ color: "#888" }}>
              Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#ccc" }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#e23636" }}
              >
                {submitting ? "En cours..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
