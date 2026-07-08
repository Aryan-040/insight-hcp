import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchDashboard } from "@/redux/slices/dashboardSlice";
import { Card, CardBody, CardHeader } from "@/components/common/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { SentimentBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import {
  INTERACTION_TYPE_LABEL,
  formatDate,
  initials,
  relativeTime,
} from "@/utils/format";

const SENTIMENT_COLORS = ["oklch(0.68 0.17 155)", "oklch(0.78 0.16 75)", "oklch(0.6 0.22 27)"];

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((s) => s.dashboard);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === "loading" || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const { stats, todaysInteractions, recentInteractions, upcomingMeetings, aiSuggestions, weeklyActivity, sentimentBreakdown } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {getGreeting()}, {user?.name.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your HCP engagement snapshot for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/log">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Log Interaction</Button>
          </Link>
          <Link to="/history">
            <Button variant="outline">View History</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Today's Interactions" value={stats.todayCount} delta={stats.todayDelta} tone="primary" />
        <StatCard icon={Users} label="Active HCPs" value={stats.activeHCPs} delta={stats.weekDelta} tone="info" />
        <StatCard icon={Clock} label="Pending Follow-ups" value={stats.pendingFollowUps} tone="warning" />
        <StatCard icon={CheckCircle2} label="This Week" value={stats.weekCount} delta={stats.weekDelta} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Weekly Activity"
            subtitle="Interactions vs follow-ups completed"
          />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="interactions" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="followUps" fill="oklch(0.7 0.15 175)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sentiment Mix" subtitle="Across recent interactions" />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentBreakdown} innerRadius={45} outerRadius={80} paddingAngle={4} dataKey="value">
                  {sentimentBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={SENTIMENT_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 flex-wrap -mt-2">
              {sentimentBreakdown.map((s, i) => (
                <div key={s.name} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLORS[i] }} />
                  {s.name} · {s.value}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Interactions"
            subtitle="Latest HCP touchpoints"
            action={
              <Link to="/history" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentInteractions.length === 0 ? (
              <EmptyState title="No interactions yet" description="Log your first HCP interaction to get started." />
            ) : (
              recentInteractions.map((i) => (
                <div key={i.id} className="flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">
                    {initials(i.hcp?.name ?? "?")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{i.hcp?.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        · {i.hcp?.specialty}
                      </span>
                      <SentimentBadge sentiment={i.sentiment} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {i.topics}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{INTERACTION_TYPE_LABEL[i.type]}</span>
                      <span>·</span>
                      <span>{formatDate(i.date)} · {i.time}</span>
                      <span>·</span>
                      <span>{relativeTime(i.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Upcoming Meetings"
              subtitle="Next 7 days"
              action={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
            <div className="p-3 space-y-2">
              {upcomingMeetings.map((m) => (
                <div key={m.id} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.hcpName}</div>
                      <div className="text-[11px] text-muted-foreground">{m.hcpSpecialty}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide rounded-md bg-primary/10 text-primary px-1.5 py-0.5">
                      {INTERACTION_TYPE_LABEL[m.type]}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(m.date)} · {m.time}
                    {m.location && <> · {m.location}</>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="AI Suggestions"
              subtitle="Recommended next actions"
              action={<Sparkles className="w-4 h-4 text-primary" />}
            />
            <div className="p-3 space-y-2">
              {aiSuggestions.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-[11px] text-primary font-medium">{s.hcpName}</div>
                  <div className="text-xs mt-0.5">{s.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Today's Interactions" subtitle="What happened today" />
        <div className="p-4">
          {todaysInteractions.length === 0 ? (
            <EmptyState
              title="Nothing logged yet today"
              description="Log your first interaction to see it here."
              action={
                <Link to="/log">
                  <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>New Interaction</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaysInteractions.map((i) => (
                <div key={i.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{i.hcp?.name}</span>
                    <SentimentBadge sentiment={i.sentiment} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {INTERACTION_TYPE_LABEL[i.type]} · {i.time}
                  </div>
                  <div className="text-xs mt-2 line-clamp-2">{i.topics}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}