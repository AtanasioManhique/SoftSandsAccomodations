// ── PraiaSectionSkeleton ──────────────────────────────────────
// Skeleton genérico reutilizável por todas as secções de praia:
// Pontahouses, PraiaTofo, PraiaDeBilene, PontaMalongane,
// Mamolihouses, PraiaBarra e qualquer futura secção similar.
//
// Uso:
//   import PraiaSectionSkeleton from "../components/PraiaSectionSkeleton";
//   if (loading) return <PraiaSectionSkeleton />;
// ─────────────────────────────────────────────────────────────

const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const CardSkeleton = () => (
  <div style={{ borderRadius: "12px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
    <div style={{ ...shimmerStyle, width: "100%", height: "192px" }} />
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <div style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ ...shimmerStyle, width: "110px", height: "14px", borderRadius: "4px" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...shimmerStyle, width: "100px", height: "14px", borderRadius: "4px" }} />
        <div style={{ ...shimmerStyle, width: "36px", height: "14px", borderRadius: "4px" }} />
      </div>
      <div style={{ ...shimmerStyle, width: "100%", height: "36px", borderRadius: "8px" }} />
    </div>
  </div>
);

const PraiaSectionSkeleton = ({ mt = "mt-1" }) => (
  <div className={`flex flex-col items-start px-4 md:px-20 pt-8 ${mt} relative`}>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Título skeleton */}
    <div style={{ ...shimmerStyle, width: "220px", height: "26px", borderRadius: "6px", marginBottom: "24px" }} />

    {/* Grid skeleton — desktop (5 colunas) */}
    <div className="hidden md:grid grid-cols-5 gap-6 w-full">
      {[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}
    </div>

    {/* Card skeleton — mobile (1 card) */}
    <div className="md:hidden w-full">
      <CardSkeleton />
    </div>
  </div>
);

export default PraiaSectionSkeleton;