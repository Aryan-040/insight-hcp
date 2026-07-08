import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setCompactMode,
  setTheme,
  updateAssistant,
  updateNotifications,
} from "@/redux/slices/settingsSlice";
import { classNames, initials } from "@/utils/format";
import { Bell, Bot, Moon, Sun, User } from "lucide-react";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { theme, compactMode, notifications, aiAssistant } = useAppSelector((s) => s.settings);
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalize your workspace, notifications, and AI Assistant.
        </p>
      </div>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><User className="w-4 h-4" /> Profile</span>} />
        <CardBody className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground grid place-items-center text-lg font-semibold">
            {initials(user?.name ?? "?")}
          </div>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{user?.role}</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Appearance" />
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-muted-foreground">Light or dark mode</div>
            </div>
            <div className="inline-flex rounded-lg border border-border p-1">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setTheme(t))}
                  className={classNames(
                    "px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                    theme === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            label="Compact mode"
            description="Reduce padding for information-dense views."
            checked={compactMode}
            onChange={(v) => dispatch(setCompactMode(v))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</span>} />
        <CardBody className="space-y-3">
          <Toggle label="Email follow-up reminders" checked={notifications.emailFollowUps} onChange={(v) => dispatch(updateNotifications({ emailFollowUps: v }))} />
          <Toggle label="In-app reminders" checked={notifications.inAppReminders} onChange={(v) => dispatch(updateNotifications({ inAppReminders: v }))} />
          <Toggle label="Daily summary email" checked={notifications.dailySummary} onChange={(v) => dispatch(updateNotifications({ dailySummary: v }))} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><Bot className="w-4 h-4" /> AI Assistant</span>} />
        <CardBody className="space-y-3">
          <Toggle label="Auto-extract fields from chat" description="Let the AI populate the form as you type." checked={aiAssistant.autoExtract} onChange={(v) => dispatch(updateAssistant({ autoExtract: v }))} />
          <Toggle label="Auto-save drafts" checked={aiAssistant.autoSaveDrafts} onChange={(v) => dispatch(updateAssistant({ autoSaveDrafts: v }))} />
        </CardBody>
      </Card>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={classNames(
          "w-10 h-6 rounded-full relative transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={classNames(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </button>
    </div>
  );
}