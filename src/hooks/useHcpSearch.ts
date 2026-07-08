import { useEffect, useState } from "react";
import { hcpApi } from "@/api/services";
import type { HCP } from "@/types";
import { useDebounce } from "./useDebounce";

export function useHcpSearch(query: string) {
  const debounced = useDebounce(query, 250);
  const [items, setItems] = useState<HCP[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    hcpApi
      .list(debounced)
      .then((r) => !cancelled && setItems(r.items))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { items, loading };
}