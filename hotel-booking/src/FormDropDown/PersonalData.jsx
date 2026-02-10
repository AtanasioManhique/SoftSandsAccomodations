import { useState } from "react";
import {useTranslation} from "react-i18next"
export default function PersonalData() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editing, setEditing] = useState(null); // "name" | "email" | "phone"
  const [tempValue, setTempValue] = useState("");
  const {t} = useTranslation();

  const handleEdit = (field) => {
    setEditing(field);
    setTempValue(data[field] || "");
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue("");
  };

  const validatePhone = (value) => {
    const regex = /^[0-9]{9,12}$/; // 9 a 12 dígitos
    return regex.test(value);
  };

  const handleSave = () => {
    if (editing === "phone" && !validatePhone(tempValue)) {
      alert("Digite um número válido (apenas números, 9 a 12 dígitos)");
      return;
    }

    if (editing) {
      setData((prev) => ({ ...prev, [editing]: tempValue }));
      setEditing(null);
      setTempValue("");
      // FUTURO: enviar update para API aqui
    }
  };

  // --- Helper: renderField (defina ANTES do return)
  const renderField = (label, field, placeholder) => (
    <div className="border-b pb-6">
      <p className="font-semibold">{label}</p>

      {editing === field ? (
        <>
          <input
            className="border px-3 py-2 rounded mt-2 w-full text-gray-800 animate-fadeIn"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            type={field === "email" ? "email" : "text"}
          />

          <div className="flex gap-3 mt-4 animate-fadeIn">
            <button
              className="px-4 py-2 bg-black text-white rounded-xl"
              onClick={handleSave}
            >
      {t("personaldata.save")}
            </button>
            <button
              className="px-4 py-2 bg-gray-200 rounded-xl"
              onClick={handleCancel}
            >
              {t("personaldata.cancel")}
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-500 mt-1">{data[field] || placeholder}</p>
          <button
            className="text-blue-600 font-semibold ml-3"
            onClick={() => handleEdit(field)}
          >
            {t("personaldata.edit")}
          </button>
        </div>
      )}
    </div>
  );

  // --- JSX do componente (apenas chamadas a renderField)
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold mb-2">{t("personaldata.data")}</h2>
      <p className="text-gray-600 mb-4">{t("personaldata.update")}</p>

      {renderField(
  t("form.name.label"),
  "name",
  t("form.name.placeholder")
)}

{renderField(
  t("form.email.label"),
  "email",
  t("form.email.placeholder")
)}

{renderField(
  t("form.phone.label"),
  "phone",
  t("form.phone.placeholder")
)}

    </div>
  );
}
