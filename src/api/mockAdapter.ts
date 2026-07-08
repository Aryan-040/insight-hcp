import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  HCP,
  Interaction,
  InteractionDraft,
  Sentiment,
} from "@/types";
import {
  computeDashboard,
  mockHCPs,
  mockInteractions,
} from "./mockData";

// A tiny in-memory "backend" so the UI works fully inside the Lovable preview.
// Every response mirrors the shapes documented in API_CONTRACT.md.

const store = {
  hcps: [...mockHCPs] as HCP[],
  interactions: [...mockInteractions] as Interaction[],
  conversations: new Map<string, ChatMessage[]>(),
};

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const nowIso = () => new Date().toISOString();

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function match(url: string, pattern: RegExp) {
  return url.match(pattern);
}

function hydrate(interaction: Interaction): Interaction {
  return {
    ...interaction,
    hcp: store.hcps.find((h) => h.id === interaction.hcpId),
  };
}

function extractDraftFromMessage(text: string): {
  draft: Partial<InteractionDraft>;
  toolTrace: ChatMessage[];
  summary: string;
} {
  const lower = text.toLowerCase();

  // Doctor extraction — matches "Dr X" / "Dr. X Y".
  const drMatch = text.match(/dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const doctorName = drMatch ? `Dr. ${drMatch[1]}` : "";
  const matchedHcp =
    store.hcps.find((h) =>
      doctorName
        ? h.name.toLowerCase().includes(drMatch![1].toLowerCase())
        : false,
    ) || undefined;

  // Sentiment heuristic — mimics the LLM sentiment tool.
  let sentiment: Sentiment = "neutral";
  if (/(interested|positive|great|excited|agreed|willing|enthusiastic)/i.test(text))
    sentiment = "positive";
  else if (/(not interested|negative|declined|refused|hesitant|concern)/i.test(text))
    sentiment = "negative";

  // Product / medicine extraction.
  const productMatch = text.match(/product\s+([A-Za-z0-9]+)/i);
  const medicineMatch = text.match(
    /\b(OncoBoost|CardioPlus|GlucoStar|PediaCough|GastroShield|NeuroCare|DermaClear)[a-zA-Z0-9\s]*\b/i,
  );
  const topics = [
    productMatch ? `Product ${productMatch[1]}` : null,
    medicineMatch ? medicineMatch[0] : null,
    text,
  ]
    .filter(Boolean)
    .join(" · ");

  // Materials extraction.
  const materials = [];
  if (/brochure/i.test(text))
    materials.push({ id: uid("mat"), name: "Product Brochure", type: "brochure" as const });
  if (/pdf|paper|study/i.test(text))
    materials.push({ id: uid("mat"), name: "Clinical Study PDF", type: "clinical_paper" as const });

  // Follow-up extraction.
  const followUps = [];
  const weeksMatch = text.match(/(\d+)\s*week/i);
  if (weeksMatch || /follow[-\s]?up/i.test(text)) {
    const weeks = weeksMatch ? parseInt(weeksMatch[1], 10) : 2;
    const due = new Date();
    due.setDate(due.getDate() + weeks * 7);
    followUps.push({
      id: uid("fu"),
      text: `Follow up in ${weeks} weeks`,
      dueDate: due.toISOString().slice(0, 10),
    });
  }

  const summary = `Meeting${
    doctorName ? ` with ${doctorName}` : ""
  } — ${sentiment} sentiment. ${
    productMatch ? `Discussed ${productMatch[0]}.` : ""
  } ${materials.length ? "Materials shared." : ""} ${
    followUps.length ? "Follow-up scheduled." : ""
  }`.trim();

  // Simulated LangGraph tool trace.
  const toolTrace: ChatMessage[] = [
    {
      id: uid("m"),
      role: "tool",
      toolName: "extract_medical_entities",
      toolStatus: "success",
      content: JSON.stringify(
        {
          doctor: doctorName || null,
          medicines: medicineMatch ? [medicineMatch[0]] : [],
          materials: materials.map((m) => m.name),
        },
        null,
        2,
      ),
      createdAt: nowIso(),
    },
    {
      id: uid("m"),
      role: "tool",
      toolName: "detect_sentiment",
      toolStatus: "success",
      content: JSON.stringify({ sentiment }),
      createdAt: nowIso(),
    },
    {
      id: uid("m"),
      role: "tool",
      toolName: "summarize_conversation",
      toolStatus: "success",
      content: summary,
      createdAt: nowIso(),
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const draft: Partial<InteractionDraft> = {
    hcpId: matchedHcp?.id ?? "",
    type: /call/i.test(lower)
      ? "call"
      : /email/i.test(lower)
        ? "email"
        : "meeting",
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    attendees: ["Amit Verma (Rep)", ...(doctorName ? [doctorName] : [])],
    topics,
    materials,
    samples: [],
    sentiment,
    outcomes: sentiment === "positive" ? "Positive engagement." : "",
    followUps,
    source: "ai",
    summary,
  };

  return { draft, toolTrace, summary };
}

function handleChat(body: ChatRequest): ChatResponse {
  const conversationId = body.conversationId ?? uid("cv");
  const prior = store.conversations.get(conversationId) ?? [];
  const userMsg: ChatMessage = {
    id: uid("m"),
    role: "user",
    content: body.message,
    createdAt: nowIso(),
  };
  const { draft, toolTrace, summary } = extractDraftFromMessage(body.message);
  const assistantMsg: ChatMessage = {
    id: uid("m"),
    role: "assistant",
    content: `I extracted the following details from your note:\n\n${summary}\n\nReview the draft on the left, edit anything you'd like, then hit **Save Interaction**.`,
    createdAt: nowIso(),
    extractedDraft: draft,
  };
  const newMessages = [...toolTrace, assistantMsg];
  store.conversations.set(conversationId, [...prior, userMsg, ...newMessages]);
  return {
    conversationId,
    messages: [userMsg, ...newMessages],
    extractedDraft: draft,
    toolCalls: toolTrace.map((t) => ({
      name: t.toolName!,
      status: "success" as const,
    })),
  };
}

export function installMockAdapter(client: AxiosInstance) {
  client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    await delay(180 + Math.random() * 250);
    const method = (config.method || "get").toLowerCase();
    const rawUrl = (config.url || "").replace(/^https?:\/\/[^/]+/, "");
    const url = rawUrl.replace(/^\/?api/, "") || "/";
    const body = config.data ? JSON.parse(config.data as string) : undefined;

    const respond = <T,>(data: T, status = 200) => ({
      data,
      status,
      statusText: "OK",
      headers: {},
      config,
    });

    try {
      if (method === "get" && url === "/dashboard")
        return respond(computeDashboard(store.interactions));

      if (method === "get" && url.startsWith("/hcps")) {
        const q =
          new URLSearchParams(url.split("?")[1] || "").get("q")?.toLowerCase() ||
          "";
        const items = q
          ? store.hcps.filter(
              (h) =>
                h.name.toLowerCase().includes(q) ||
                h.specialty.toLowerCase().includes(q) ||
                h.hospital.toLowerCase().includes(q),
            )
          : store.hcps;
        return respond({ items, total: items.length, page: 1, pageSize: items.length });
      }

      const idMatch = match(url, /^\/interactions\/([^/?]+)$/);

      if (method === "get" && url.startsWith("/interactions") && !idMatch) {
        const params = new URLSearchParams(url.split("?")[1] || "");
        const q = params.get("q")?.toLowerCase() || "";
        const type = params.get("type") || "";
        const sentiment = params.get("sentiment") || "";
        let items = store.interactions.map(hydrate);
        if (q)
          items = items.filter(
            (i) =>
              i.hcp?.name.toLowerCase().includes(q) ||
              i.topics.toLowerCase().includes(q) ||
              i.outcomes.toLowerCase().includes(q),
          );
        if (type) items = items.filter((i) => i.type === type);
        if (sentiment) items = items.filter((i) => i.sentiment === sentiment);
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return respond({ items, total: items.length, page: 1, pageSize: items.length });
      }

      if (method === "get" && idMatch) {
        const found = store.interactions.find((i) => i.id === idMatch[1]);
        if (!found) return respond({ detail: "Not found" }, 404);
        return respond(hydrate(found));
      }

      if (method === "post" && url === "/interactions") {
        const draft = body as InteractionDraft;
        const created: Interaction = {
          ...draft,
          id: uid("int"),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        store.interactions.unshift(created);
        return respond(hydrate(created), 201);
      }

      if (method === "put" && idMatch) {
        const idx = store.interactions.findIndex((i) => i.id === idMatch[1]);
        if (idx === -1) return respond({ detail: "Not found" }, 404);
        const updated: Interaction = {
          ...store.interactions[idx],
          ...(body as InteractionDraft),
          id: store.interactions[idx].id,
          updatedAt: nowIso(),
        };
        store.interactions[idx] = updated;
        return respond(hydrate(updated));
      }

      if (method === "delete" && idMatch) {
        const idx = store.interactions.findIndex((i) => i.id === idMatch[1]);
        if (idx === -1) return respond({ detail: "Not found" }, 404);
        store.interactions.splice(idx, 1);
        return respond({ success: true });
      }

      if (method === "post" && url === "/chat")
        return respond(handleChat(body as ChatRequest));

      return respond({ detail: `Mock: no handler for ${method.toUpperCase()} ${url}` }, 404);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Mock error";
      return respond({ detail: message }, 500);
    }
  };
}