import { useState } from "react";
import PaymentMethods from "./PaymentMethods";
import {useTranslation} from "react-i18next"

export default function Payments() {
  const [openMethods, setOpenMethods] = useState(false);
  const [openCardForm, setOpenCardForm] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const {t} = useTranslation();

  // Quando clicar em Visa
  const handleSelectVisa = () => {
    setOpenMethods(false);     // fecha modal de métodos
    setOpenCardForm(true);     // abre formulário Visa
  };

  // Ao salvar cartão
  const handleSuccess = () => {
    setOpenCardForm(false);    // fecha formulário
    setSuccessModal(true);     // abre mensagem sucesso
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("payments.title")}</h2>

      <div className="border-b py-4 flex justify-between">
        <div>
          <p className="font-semibold mb-1 -mt-3">{t("payments.method")}</p>
          <p className="text-gray-500">{t("payments.cards")}</p>
        </div>

        <button className="text-blue-600" onClick={() => setOpenMethods(true)}>
          {t("payments.manage")}
        </button>
      </div>

      {/* MODAL: Métodos */}
      {openMethods && (
        <PaymentMethods
          onClose={() => setOpenMethods(false)}
          onSelectVisa={handleSelectVisa}
        />
      )}

      {/* MODAL: Formulário do Cartão */}
      {openCardForm && (
        <PaymentCardForm
          onClose={() => setOpenCardForm(false)}  // FECHA ao clicar X ou Cancel
          onSuccess={handleSuccess}               // SUCCESS → fecha + mostra tela
        />
      )}

      {/* MODAL: Sucesso */}
      {successModal && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center animate-fadeIn max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-2">{t("payment.success")}</h2>
            <p className="text-gray-600 mb-2">{t("payment.keep")}</p>

            <button
              className="bg-black text-white px-5 py-2 rounded-lg w-full"
              onClick={() => setSuccessModal(false)}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
