import { Search, Bell, Moon, Sun, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { toggleTheme } from "@/redux/slices/settingsSlice";
import { initials } from "@/utils/format";

export function TopBar() {
  const theme = useAppSelector((s) => s.settings.theme);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  return (
    <header className="h-16 sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md flex items-center gap-3 px-4 md:px-6">
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search doctors, interactions, follow-ups…"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
        />
      </div>

      <Link
        to="/log"
        className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus className="w-4 h-4" /> Log Interaction
      </Link>

      <button
        onClick={() => dispatch(toggleTheme())}
        className="w-10 h-10 grid place-items-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        className="w-10 h-10 grid place-items-center rounded-lg hover:bg-muted transition-colors text-muted-foreground relative"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
      </button>

      {user && (
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium leading-tight">{user.name}</div>
            <div className="text-[11px] text-muted-foreground">{user.role}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center text-xs font-semibold shadow-sm">
            {initials(user.name)}
          </div>
        </div>
      )}
    </header>
  );
}