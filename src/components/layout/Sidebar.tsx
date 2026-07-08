import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Settings as SettingsIcon,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { classNames } from "@/utils/format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/uiSlice";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/log", label: "Log Interaction", icon: PlusCircle },
  { to: "/history", label: "History", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const dispatch = useAppDispatch();

  return (
    <aside
      className={classNames(
        "hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 h-16 px-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
          <Stethoscope className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold leading-tight truncate">MedRep AI</div>
            <div className="text-[11px] text-muted-foreground truncate">
              HCP Engagement CRM
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={classNames(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3 mb-3">
            <div className="flex items-center gap-2 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" /> AI Assistant Ready
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Log interactions 5× faster with natural language.
            </p>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </aside>
  );
}