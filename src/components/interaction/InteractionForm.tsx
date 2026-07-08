import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Save,
  RotateCcw,
  Mic,
  Sparkles,
  Plus,
  X,
  Search,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import type {
  HCP,
  InteractionDraft,
  Material,
  Sample,
  Sentiment,
} from "@/types";
import { HcpCombobox } from "./HcpCombobox";
import { Button } from "@/components/common/Button";
import { classNames, INTERACTION_TYPE_LABEL } from "@/utils/format";
import {
  mockMaterialsCatalog,
  mockProductsCatalog,
} from "@/api/mockData";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { saveInteraction } from "@/redux/slices/interactionsSlice";
import { clearExtractedDraft } from "@/redux/slices/chatSlice";

const TYPES: InteractionDraft["type"][] = [
  "meeting",
  "call",
  "email",
  "conference",
  "sample_drop",
  "virtual",
];

const SENTIMENTS: { value: Sentiment; label: string; emoji: string }[] = [
  { value: "positive", label: "Positive", emoji: "😊" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "negative", label: "Negative", emoji: "🙁" },
];

const emptyDraft: InteractionDraft = {
  hcpId: "",
  type: "meeting",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  attendees: [],
  topics: "",
  materials: [],
  samples: [],
  sentiment: "neutral",
  outcomes: "",
  followUps: [],
  notes: "",
  source: "form",
};

export function InteractionForm() {
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.interactions.saving);
  const extractedDraft = useAppSelector((s) => s.chat.extractedDraft);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InteractionDraft>({ defaultValues: emptyDraft });

  // Merge AI-extracted fields into the form as they arrive.
  useEffect(() => {
    if (!extractedDraft) return;
    Object.entries(extractedDraft).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(k as any, v as any, { shouldDirty: true });
      }
    });
    toast.success("AI populated the form", {
      description: "Review the extracted fields below.",
    });
  }, [extractedDraft, setValue]);

  // Auto-save draft to localStorage.
  const values = watch();
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem("hcp_interaction_draft", JSON.stringify(values));
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [values]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hcp_interaction_draft");
      if (raw) reset(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [reset]);

  const onSubmit = async (data: InteractionDraft) => {
    if (!data.hcpId) {
      toast.error("Please select an HCP");
      return;
    }
    if (!data.topics.trim()) {
      toast.error("Please add discussion topics");
      return;
    }
    const res = await dispatch(saveInteraction(data));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Interaction saved", {
        description: "It's now visible in Dashboard and History.",
      });
      localStorage.removeItem("hcp_interaction_draft");
      dispatch(clearExtractedDraft());
      reset(emptyDraft);
    } else {
      toast.error("Save failed", { description: String(res.payload) });
    }
  };

  const onReset = () => {
    reset(emptyDraft);
    localStorage.removeItem("hcp_interaction_draft");
    dispatch(clearExtractedDraft());
    toast.info("Form reset");
  };

  const materials = watch("materials") || [];
  const samples = watch("samples") || [];
  const followUps = watch("followUps") || [];
  const attendees = watch("attendees") || [];

  const addMaterial = (m: Material) => {
    if (materials.find((x) => x.id === m.id)) return;
    setValue("materials", [...materials, m], { shouldDirty: true });
  };
  const removeMaterial = (id: string) =>
    setValue(
      "materials",
      materials.filter((m) => m.id !== id),
      { shouldDirty: true },
    );

  const addSample = () =>
    setValue(
      "samples",
      [
        ...samples,
        {
          id: `s_${Date.now()}`,
          productName: mockProductsCatalog[0],
          quantity: 1,
        },
      ],
      { shouldDirty: true },
    );
  const removeSample = (id: string) =>
    setValue(
      "samples",
      samples.filter((s) => s.id !== id),
      { shouldDirty: true },
    );
  const updateSample = (id: string, patch: Partial<Sample>) =>
    setValue(
      "samples",
      samples.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      { shouldDirty: true },
    );

  const addAttendee = (name: string) => {
    if (!name.trim()) return;
    setValue("attendees", [...attendees, name.trim()], { shouldDirty: true });
  };
  const removeAttendee = (i: number) =>
    setValue(
      "attendees",
      attendees.filter((_, idx) => idx !== i),
      { shouldDirty: true },
    );

  const addFollowUp = () =>
    setValue(
      "followUps",
      [
        ...followUps,
        { id: `f_${Date.now()}`, text: "", completed: false },
      ],
      { shouldDirty: true },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* HCP + Interaction Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="HCP Name" required error={errors.hcpId?.message}>
          <Controller
            control={control}
            name="hcpId"
            rules={{ required: "HCP is required" }}
            render={({ field }) => (
              <HcpCombobox
                value={field.value}
                onChange={(hcp: HCP) => field.onChange(hcp.id)}
              />
            )}
          />
        </Field>
        <Field label="Interaction Type" required>
          <select
            {...register("type", { required: true })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {INTERACTION_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" required>
          <input
            type="date"
            {...register("date", { required: true })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Time" required>
          <input
            type="time"
            {...register("time", { required: true })}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Field>
      </div>

      <Field label="Attendees">
        <div className="rounded-lg border border-input bg-background p-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attendees.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
              >
                {a}
                <button
                  type="button"
                  onClick={() => removeAttendee(i)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            placeholder="Add name, press Enter"
            className="w-full h-8 px-2 text-sm bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAttendee((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      </Field>

      <Field label="Topics Discussed" required error={errors.topics?.message}>
        <div className="relative">
          <textarea
            {...register("topics", { required: "Please add discussion topics" })}
            rows={4}
            placeholder="Enter key discussion points…"
            className="w-full rounded-lg border border-input bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 text-muted-foreground hover:text-primary transition-colors"
            title="Record voice note"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" /> Summarize from Voice Note (Requires Consent)
        </button>
      </Field>

      {/* Materials & Samples */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Materials Shared</div>
            <MaterialsPicker onPick={addMaterial}>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-md border border-border bg-background hover:bg-muted transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Search/Add
              </button>
            </MaterialsPicker>
          </div>
          {materials.length === 0 ? (
            <div className="text-xs text-muted-foreground">No materials added.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {materials.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
                >
                  {m.name}
                  <button
                    type="button"
                    onClick={() => removeMaterial(m.id)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Samples Distributed</div>
            <button
              type="button"
              onClick={addSample}
              className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <Package className="w-3.5 h-3.5" /> Add Sample
            </button>
          </div>
          {samples.length === 0 ? (
            <div className="text-xs text-muted-foreground">No samples added.</div>
          ) : (
            <div className="space-y-2">
              {samples.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md bg-background border border-border p-2"
                >
                  <select
                    value={s.productName}
                    onChange={(e) =>
                      updateSample(s.id, { productName: e.target.value })
                    }
                    className="flex-1 h-8 px-2 rounded-md bg-transparent text-sm outline-none"
                  >
                    {mockProductsCatalog.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={s.quantity}
                    onChange={(e) =>
                      updateSample(s.id, {
                        quantity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-20 h-8 px-2 rounded-md border border-input text-sm text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeSample(s.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Field label="Observed/Inferred HCP Sentiment">
        <Controller
          control={control}
          name="sentiment"
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-2">
              {SENTIMENTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => field.onChange(s.value)}
                  className={classNames(
                    "flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-medium transition-all",
                    field.value === s.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40",
                  )}
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        />
      </Field>

      <Field label="Outcomes">
        <textarea
          {...register("outcomes")}
          rows={3}
          placeholder="Key outcomes or agreements…"
          className="w-full rounded-lg border border-input bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </Field>

      <Field label="Follow-up Actions">
        <div className="space-y-2">
          {followUps.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <input
                value={f.text}
                onChange={(e) => {
                  const next = [...followUps];
                  next[i] = { ...f, text: e.target.value };
                  setValue("followUps", next, { shouldDirty: true });
                }}
                placeholder="Next step or task…"
                className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={f.dueDate ?? ""}
                onChange={(e) => {
                  const next = [...followUps];
                  next[i] = { ...f, dueDate: e.target.value };
                  setValue("followUps", next, { shouldDirty: true });
                }}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "followUps",
                    followUps.filter((_, idx) => idx !== i),
                    { shouldDirty: true },
                  )
                }
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFollowUp}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add follow-up
          </button>
        </div>
      </Field>

      <Field label="Notes">
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Additional notes (optional)…"
          className="w-full rounded-lg border border-input bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </Field>

      <div className="sticky bottom-0 -mx-5 px-5 py-4 bg-card/95 backdrop-blur border-t border-border flex items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground">
          Draft auto-saves as you type.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" type="button" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Interaction
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <div className="text-[11px] text-destructive">{error}</div>}
    </div>
  );
}

function MaterialsPicker({
  onPick,
  children,
}: {
  onPick: (m: Material) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border border-border bg-popover shadow-lg hidden group-hover:block group-focus-within:block">
        <div className="p-1 max-h-64 overflow-y-auto">
          {mockMaterialsCatalog.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent"
            >
              {m.name}
              <span className="text-[10px] text-muted-foreground ml-1">
                · {m.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}