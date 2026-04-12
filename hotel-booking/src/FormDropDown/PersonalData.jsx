import { useState, useEffect } from "react";
import {useTranslation} from "react-i18next"
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";


export default function PersonalData() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editing, setEditing] = useState(null); // "name" | "email" | "phone"
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        const profile = res.data?.user ?? res.data?.data ?? {};
        setData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || ""
        });
      } catch (err) {
        if (user) setData({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
        console.error("Erro ao carregar perfil:", err);
      }
    };
    loadProfile();
  }, [user]);

  const handleEdit = (field) => {
    setEditing(field);
    setTempValue(data[field] || "");
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue("");
  };

  const validatePhone = (value) => /^[0-9]{9,12}$/.test(value);

  const handleSave = async () => {
    if (editing === "phone" && !validatePhone(tempValue)) {
      alert("Digite um número válido (apenas números, 9 a 12 dígitos)");
      return;
    }

    setSaving(true);
    try {
      await api.put("/users/profile", { [editing]: tempValue });
      setData((prev) => ({ ...prev, [editing]: tempValue }));
      setEditing(null);
      setTempValue("");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      const msg = err.response?.data?.message || "Erro ao salvar. Tente novamente.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };


  // --- Helper: renderField (defina ANTES do return)
  const renderField = (label, field, placeholder) => (
    <div className="border-b pb-6">
      <p className="font-semibold">{label}</p>
      {editing === field ? (
        <>
          <input
            className="border px-3 py-2 rounded mt-2 w-full text-gray-800"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            type={field === "email" ? "email" : "text"}
          />
          <div className="flex gap-3 mt-4">
            <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50">
              {saving ? "..." : t("personaldata.save")}
            </button>
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded-xl">
              {t("personaldata.cancel")}
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-500 mt-1">{data[field] || placeholder}</p>
          <button className="text-blue-600 font-semibold ml-3" onClick={() => handleEdit(field)}>
            {t("personaldata.edit")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold mb-2">{t("personaldata.data")}</h2>
      <p className="text-gray-600 mb-4">{t("personaldata.update")}</p>

      {renderField(t("form.name.label"),  "name",  t("form.name.placeholder"))}
      {renderField(t("form.email.label"), "email", t("form.email.placeholder"))}
      {renderField(t("form.phone.label"), "phone", t("form.phone.placeholder"))}
    </div>
  );
}
