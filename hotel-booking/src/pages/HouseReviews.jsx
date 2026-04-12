// src/pages/HouseReviews.jsx
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useLoginModal } from "../context/LoginModalContext";
import { api } from "../services/api";
import StarRating from "../components/Star.jsx";

// ── Shimmer skeleton ──────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

export const HouseReviewsSkeleton = () => (
  <div className="mt-12 space-y-8 px-4 sm:px-0">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ ...shimmerStyle, width: "200px", height: "28px", borderRadius: "6px" }} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "12px" }}>
          <div style={{ ...shimmerStyle, width: "90px", height: "14px", borderRadius: "4px", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "8px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ ...shimmerStyle, width: "100%", height: "100%" }} />
          </div>
          <div style={{ ...shimmerStyle, width: "30px", height: "14px", borderRadius: "4px", flexShrink: 0 }} />
        </div>
      ))}
    </div>
    <hr className="border-gray-200" />
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "20px", background: "#fff", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ ...shimmerStyle, width: "120px", height: "14px", borderRadius: "4px" }} />
              <div style={{ ...shimmerStyle, width: "80px", height: "12px", borderRadius: "4px" }} />
            </div>
            <div style={{ ...shimmerStyle, width: "70px", height: "12px", borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {[...Array(5)].map((_, s) => (
              <div key={s} style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "3px" }} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ ...shimmerStyle, width: "100%", height: "13px", borderRadius: "4px" }} />
            <div style={{ ...shimmerStyle, width: "75%", height: "13px", borderRadius: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Estrelas interativas ──────────────────────────────────────
const StarInput = ({ value, onChange, size = 28 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "2px",
            transition: "transform 0.15s ease",
            transform: hovered >= star ? "scale(1.2)" : "scale(1)",
          }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={(hovered || value) >= star ? "#F59E0B" : "#E5E7EB"}
              stroke={(hovered || value) >= star ? "#F59E0B" : "#D1D5DB"}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

// ── Labels das categorias ─────────────────────────────────────
const CATEGORY_KEYS = ["limpeza", "localizacao", "conforto", "comunicacao"];
const CATEGORY_ICONS = {
  limpeza:       "🧹",
  localizacao:   "📍",
  conforto:      "🛋️",
  comunicacao:   "💬",
};

// ── Formulário de review ──────────────────────────────────────
const ReviewForm = ({ houseId, onSubmitted }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();

  const [stars, setStars]           = useState(0);
  const [comment, setComment]       = useState("");
  const [categories, setCategories] = useState({ limpeza: 0, localizacao: 0, conforto: 0, comunicacao: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  const handleCategoryChange = (key, val) => {
    setCategories((prev) => ({ ...prev, [key]: val }));
  };

  const allFilled =
    stars > 0 &&
    comment.trim().length >= 10 &&
    Object.values(categories).every((v) => v > 0);

  const handleSubmit = async () => {
    if (!user) { openLogin(); return; }
    if (!allFilled) { setError("Por favor preencha todos os campos antes de submeter."); return; }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/reviews", {
        accommodationId: houseId,
        stars,
        comment: comment.trim(),
        categories,
      });
      
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? "Erro ao submeter avaliação. Tenta novamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        border: "1.5px solid #86efac",
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
        <p style={{ fontWeight: "700", fontSize: "18px", color: "#15803d", marginBottom: "6px" }}>
          Avaliação enviada!
        </p>
        <p style={{ color: "#4ade80", fontSize: "14px" }}>
          Obrigado pelo teu feedback. A tua avaliação será publicada após moderação.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e5e7eb",
      borderRadius: "20px",
      padding: "28px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: "700", fontSize: "18px", color: "#111827", marginBottom: "4px" }}>
          ✍️ Deixa a tua avaliação
        </h3>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          A tua experiência ajuda outros viajantes a escolher melhor.
        </p>
      </div>

      {/* Avaliação geral */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#374151", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Avaliação geral
        </label>
        <StarInput value={stars} onChange={setStars} size={32} />
        {stars > 0 && (
          <p style={{ marginTop: "6px", fontSize: "13px", color: "#F59E0B", fontWeight: "600" }}>
            {["", "Muito mau", "Mau", "Razoável", "Bom", "Excelente!"][stars]}
          </p>
        )}
      </div>

      {/* Categorias */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Avalia por categoria
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {CATEGORY_KEYS.map((key) => (
            <div key={key} style={{
              background: "#f9fafb",
              borderRadius: "14px",
              padding: "14px",
              border: categories[key] > 0 ? "1.5px solid #fbbf24" : "1.5px solid #e5e7eb",
              transition: "border-color 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>{CATEGORY_ICONS[key]}</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563", textTransform: "capitalize" }}>
                  {t(`categories.${key}`, key)}
                </span>
              </div>
              <StarInput value={categories[key]} onChange={(v) => handleCategoryChange(key, v)} size={20} />
            </div>
          ))}
        </div>
      </div>

      {/* Comentário */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontWeight: "600", fontSize: "13px", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Comentário
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conta a tua experiência nesta casa... (mínimo 10 caracteres)"
          rows={4}
          style={{
            width: "100%",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "14px",
            color: "#111827",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
            background: "#fafafa",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#374151")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <p style={{ fontSize: "12px", color: comment.length < 10 ? "#9ca3af" : "#10b981", marginTop: "4px", textAlign: "right" }}>
          {comment.length} caracteres {comment.length < 10 ? `(mínimo 10)` : "✓"}
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px",
          padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#dc2626",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Botão */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !allFilled}
        style={{
          width: "100%",
          background: allFilled ? "#1a1a2e" : "#e5e7eb",
          color: allFilled ? "#fff" : "#9ca3af",
          border: "none",
          borderRadius: "12px",
          padding: "14px",
          fontWeight: "700",
          fontSize: "15px",
          cursor: allFilled && !submitting ? "pointer" : "not-allowed",
          transition: "background 0.2s, transform 0.1s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => { if (allFilled && !submitting) e.currentTarget.style.background = "#2d2d4e"; }}
        onMouseLeave={(e) => { if (allFilled && !submitting) e.currentTarget.style.background = "#1a1a2e"; }}
      >
        {submitting ? (
          <>
            <span style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
            A enviar...
          </>
        ) : (
          "Publicar avaliação"
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Bloco de acesso bloqueado ─────────────────────────────────
const LockedReviewForm = ({ onLogin }) => (
  <div style={{
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    border: "1.5px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "36px 28px",
    textAlign: "center",
  }}>
    <div style={{
      width: "56px", height: "56px", background: "#1a1a2e", borderRadius: "16px",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 16px", fontSize: "24px",
    }}>
      🔒
    </div>
    <p style={{ fontWeight: "700", fontSize: "17px", color: "#1a1a2e", marginBottom: "8px" }}>
      Só hóspedes podem avaliar
    </p>
    <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
      Para deixar uma avaliação, precisas de ter uma reserva confirmada nesta casa.
    </p>
    <button
      onClick={onLogin}
      style={{
        background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "12px",
        padding: "12px 28px", fontWeight: "700", fontSize: "14px", cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d4e")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}
    >
      Fazer login
    </button>
  </div>
);

// ── Componente principal ──────────────────────────────────────
const HouseReviews = ({ house, userHasBooking = false }) => {
  const [showAll, setShowAll]         = useState(false);
  const [reviews, setReviews]         = useState(house.reviews ?? []);
  const { t }                         = useTranslation();
  const { user }                      = useAuth();
  const { openLogin }                 = useLoginModal();

  const canReview = user && userHasBooking;

  // Verifica se o utilizador já avaliou esta casa
  const alreadyReviewed = useMemo(() => {
    if (!user || !reviews.length) return false;
    return reviews.some(
      (r) => r.userId === user.id || r.user_id === user.id
    );
  }, [reviews, user]);

  const categoriesData = useMemo(() => {
    const sums = {}, counts = {};
    reviews.forEach((review) => {
      Object.entries(review.categories || {}).forEach(([key, value]) => {
        sums[key]   = (sums[key]   || 0) + Number(value);
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.keys(sums).map((key) => ({
      categoria: key,
      nota: sums[key] / counts[key],
    }));
  }, [reviews]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, r) => acc + (r.stars || 0), 0) / reviews.length;
  }, [reviews]);

  const reviewsToShow = showAll ? reviews : reviews.slice(0, 5);

  const handleReviewSubmitted = async () => {
    try {
      const res = await api.get(`/accommodations/${house.id}`);
      const raw = res.data?.data?.accommodation ?? res.data?.data ?? res.data;
      if (raw?.reviews) setReviews(raw.reviews);
    } catch {
      // mantém os reviews actuais
    }
  };

  return (
    <div id="reviews" style={{ marginTop: "48px" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-card { animation: fadeInUp 0.4s ease both; }
      `}</style>

      {/* ── Cabeçalho ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontWeight: "800", fontSize: "22px", color: "#111827", marginBottom: "4px" }}>
            {t("housereviews.avaliations", "Avaliações")}
          </h2>
          {reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e", lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </span>
              <div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={avgRating >= s ? "#F59E0B" : "#E5E7EB"}
                        stroke={avgRating >= s ? "#F59E0B" : "#D1D5DB"}
                        strokeWidth="1"
                      />
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Categorias ── */}
      {categoriesData.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {categoriesData.map((cat) => (
              <div key={cat.categoria} style={{
                background: "#f9fafb",
                borderRadius: "14px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <span style={{ fontSize: "18px" }}>{CATEGORY_ICONS[cat.categoria] ?? "⭐"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563", textTransform: "capitalize" }}>
                      {t(`categories.${cat.categoria}`, cat.categoria)}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a2e" }}>
                      {cat.nota.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(cat.nota / 5) * 100}%`,
                      background: "linear-gradient(90deg, #1a1a2e, #4f4f7a)",
                      borderRadius: "999px",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr style={{ border: "none", borderTop: "1.5px solid #f0f0f0", marginBottom: "32px" }} />

      {/* ── Lista de comentários ── */}
      {reviews.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 20px",
          background: "#f9fafb", borderRadius: "16px", marginBottom: "32px",
        }}>
          <p style={{ fontSize: "36px", marginBottom: "12px" }}>🏖️</p>
          <p style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Ainda sem avaliações</p>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>Sê o primeiro a partilhar a tua experiência nesta casa!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {reviewsToShow.map((review, i) => (
            <div
              key={review.id}
              className="review-card"
              style={{
                background: "#fff",
                border: "1.5px solid #f0f0f0",
                borderRadius: "20px",
                padding: "20px 22px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #1a1a2e, #4f4f7a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0,
                    }}>
                      {(review.user_name ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "14px", color: "#111827", margin: 0 }}>{review.user_name}</p>
                      {review.user_location && (
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>📍 {review.user_location}</p>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {new Date(review.date ?? review.createdAt).toLocaleDateString("pt-PT", { year: "numeric", month: "long" })}
                </span>
              </div>

              {/* Estrelas */}
              <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill={review.stars >= s ? "#F59E0B" : "#E5E7EB"}
                      stroke={review.stars >= s ? "#F59E0B" : "#D1D5DB"}
                      strokeWidth="1"
                    />
                  </svg>
                ))}
              </div>

              {/* Comentário */}
              <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar mais / menos */}
      {reviews.length > 5 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: "#fff", border: "1.5px solid #1a1a2e", borderRadius: "12px",
              padding: "10px 24px", fontWeight: "600", fontSize: "14px", color: "#1a1a2e",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1a2e"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a1a2e"; }}
          >
            {showAll ? t("housereviews.less", "Ver menos") : t("housereviews.more", "Ver todas as avaliações")}
          </button>
        </div>
      )}

      <hr style={{ border: "none", borderTop: "1.5px solid #f0f0f0", marginBottom: "28px" }} />

      {/* ── Formulário ── */}
      <div style={{ marginBottom: "8px" }}>
        {!user ? (
          <LockedReviewForm onLogin={openLogin} />
        ) : !canReview ? (
          <div style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1.5px dashed #cbd5e1",
            borderRadius: "20px",
            padding: "36px 28px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏠</div>
            <p style={{ fontWeight: "700", fontSize: "17px", color: "#1a1a2e", marginBottom: "8px" }}>
              Reserva esta casa para avaliar
            </p>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
              Só é possível deixar avaliações após uma reserva confirmada nesta propriedade.
            </p>
          </div>
        ) : alreadyReviewed ? (
          <div style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1.5px solid #93c5fd",
            borderRadius: "20px",
            padding: "28px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
            <p style={{ fontWeight: "700", fontSize: "16px", color: "#1d4ed8", marginBottom: "4px" }}>
              Já avaliaste esta casa
            </p>
            <p style={{ color: "#3b82f6", fontSize: "14px" }}>
              Obrigado pelo teu feedback!
            </p>
          </div>
        ) : (
          <ReviewForm houseId={house.id} onSubmitted={handleReviewSubmitted} />
        )}
      </div>
    </div>
  );
};

export default HouseReviews;