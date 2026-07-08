import { useEffect } from "react";
import { Search, Filter, Trash2, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  deleteInteraction,
  fetchInteractions,
  setFilters,
} from "@/redux/slices/interactionsSlice";
import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { SentimentBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import {
  formatDate,
  initials,
  INTERACTION_TYPE_LABEL,
  relativeTime,
} from "@/utils/format";
import { toast } from "sonner";

export function HistoryPage() {
  const dispatch = useAppDispatch();
  const { items, status, filters } = useAppSelector((s) => s.interactions);

  useEffect(() => {
    dispatch(fetchInteractions(filters));
  }, [dispatch, filters]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this interaction? This cannot be undone.")) return;
    const res = await dispatch(deleteInteraction(id));
    if (res.meta.requestStatus === "fulfilled") toast.success("Interaction deleted");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Interaction History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, and review your logged HCP interactions.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {items.length} interaction{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.q}
              onChange={(e) => dispatch(setFilters({ q: e.target.value }))}
              placeholder="Search doctors, topics, outcomes…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => dispatch(setFilters({ type: e.target.value }))}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">All Types</option>
            {Object.entries(INTERACTION_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={filters.sentiment}
            onChange={(e) => dispatch(setFilters({ sentiment: e.target.value }))}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() =>
              dispatch(setFilters({ q: "", type: "", sentiment: "" }))
            }
          >
            Clear
          </Button>
        </div>
      </Card>

      <Card>
        {status === "loading" ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No interactions found"
            description="Try adjusting filters or log a new one."
          />
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_120px_140px_130px_120px_90px] gap-3 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground bg-muted/30">
              <div>HCP & Topic</div>
              <div>Type</div>
              <div>Date</div>
              <div>Sentiment</div>
              <div>Logged</div>
              <div className="text-right">Actions</div>
            </div>
            {items.map((i) => (
              <div
                key={i.id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_120px_140px_130px_120px_90px] gap-3 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">
                    {initials(i.hcp?.name ?? "?")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {i.hcp?.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        · {i.hcp?.specialty}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {i.topics}
                    </div>
                  </div>
                </div>
                <div className="text-xs">{INTERACTION_TYPE_LABEL[i.type]}</div>
                <div className="text-xs">
                  {formatDate(i.date)}
                  <div className="text-muted-foreground text-[11px]">{i.time}</div>
                </div>
                <div>
                  <SentimentBadge sentiment={i.sentiment} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {relativeTime(i.createdAt)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="w-8 h-8 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="w-8 h-8 grid place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(i.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}