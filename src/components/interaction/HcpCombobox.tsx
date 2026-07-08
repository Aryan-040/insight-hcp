import { useEffect, useRef, useState } from "react";
import { Search, Check, Building2 } from "lucide-react";
import { classNames, initials } from "@/utils/format";
import { useHcpSearch } from "@/hooks/useHcpSearch";
import type { HCP } from "@/types";

export function HcpCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (hcp: HCP) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HCP | null>(null);
  const { items, loading } = useHcpSearch(q);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (value && (!selected || selected.id !== value)) {
      const match = items.find((h) => h.id === value);
      if (match) setSelected(match);
    }
    if (!value) setSelected(null);
  }, [value, items, selected]);

  return (
    <div ref={rootRef} className="relative">
      <div
        className="w-full h-10 flex items-center gap-2 px-3 rounded-lg border border-input bg-background cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        {selected ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-semibold">
              {initials(selected.name)}
            </span>
            <div className="text-sm truncate">
              <span className="font-medium">{selected.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {selected.specialty}
              </span>
            </div>
          </div>
        ) : (
          <input
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            placeholder="Search or select HCP…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        )}
      </div>

      {open && (
        <div className="absolute z-40 top-full mt-2 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {selected && (
            <div className="p-2 border-b border-border">
              <input
                className="w-full h-9 px-3 rounded-md bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search other HCPs…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto py-1">
            {loading && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matching HCPs
              </div>
            )}
            {items.map((hcp) => (
              <button
                key={hcp.id}
                type="button"
                onClick={() => {
                  setSelected(hcp);
                  onChange(hcp);
                  setOpen(false);
                  setQ("");
                }}
                className={classNames(
                  "w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors",
                  value === hcp.id && "bg-accent",
                )}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">
                  {initials(hcp.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{hcp.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span>{hcp.specialty}</span>
                    <span>·</span>
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{hcp.hospital}</span>
                  </div>
                </div>
                {value === hcp.id && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}