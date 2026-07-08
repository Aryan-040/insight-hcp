import { Provider } from "react-redux";
import { useEffect, type ReactNode } from "react";
import { store, useAppSelector } from "./store";

function ThemeSync({ children }: { children: ReactNode }) {
  const theme = useAppSelector((s) => s.settings.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync>{children}</ThemeSync>
    </Provider>
  );
}