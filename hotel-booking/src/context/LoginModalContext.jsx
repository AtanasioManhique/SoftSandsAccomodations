import { createContext, useContext, useState } from "react";

const LoginModalContext = createContext();

export function LoginModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openLogin = () => setOpen(true);
  const closeLogin = () => setOpen(false);

  return (
    <LoginModalContext.Provider value={{ open, openLogin, closeLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  return useContext(LoginModalContext);
}
