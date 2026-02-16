import LoginPage from "../FormDropDown/LoginForm";
import { useLoginModal } from "./LoginModalContext";

export default function LoginModal() {
  const { open, closeLogin } = useLoginModal();

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
      "
      onClick={closeLogin}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <LoginPage />
      </div>
    </div>
  );
}
