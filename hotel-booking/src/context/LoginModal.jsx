// context/LoginModal.jsx
import { X } from "lucide-react";
import LoginPage from "../FormDropDown/LoginForm";
import { useLoginModal } from "./LoginModalContext";

export default function LoginModal() {
  const { open, closeLogin } = useLoginModal();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-fadeIn">

        {/* Botão fechar */}
        <button
          onClick={closeLogin}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <X size={22} />
        </button>

        {/* LoginPage com onSuccess para fechar o modal após login */}
        <div className="p-6">
          <LoginPage isModal onSuccess={closeLogin} />
        </div>

      </div>
    </div>
  );
}