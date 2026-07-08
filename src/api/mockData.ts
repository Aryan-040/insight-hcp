import type {
  HCP,
  Interaction,
  DashboardPayload,
  DashboardMeeting,
  AISuggestion,
} from "@/types";

export const mockHCPs: HCP[] = [
  {
    id: "hcp_001",
    name: "Dr. Anika Sharma",
    specialty: "Oncology",
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    email: "anika.sharma@apollo.example",
    phone: "+91 98200 11122",
    tier: "A",
  },
  {
    id: "hcp_002",
    name: "Dr. Rohan Mehta",
    specialty: "Cardiology",
    hospital: "Fortis Healthcare",
    city: "Delhi",
    email: "rohan.mehta@fortis.example",
    tier: "A",
  },
  {
    id: "hcp_003",
    name: "Dr. Priya Iyer",
    specialty: "Endocrinology",
    hospital: "Manipal Hospitals",
    city: "Bengaluru",
    tier: "B",
  },
  {
    id: "hcp_004",
    name: "Dr. Sameer Khan",
    specialty: "Neurology",
    hospital: "Max Super Speciality",
    city: "Delhi",
    tier: "B",
  },
  {
    id: "hcp_005",
    name: "Dr. Lakshmi Rao",
    specialty: "Pediatrics",
    hospital: "Rainbow Children's Hospital",
    city: "Hyderabad",
    tier: "C",
  },
  {
    id: "hcp_006",
    name: "Dr. Vikram Nair",
    specialty: "Gastroenterology",
    hospital: "Kokilaben Hospital",
    city: "Mumbai",
    tier: "A",
  },
  {
    id: "hcp_007",
    name: "Dr. Meera Joshi",
    specialty: "Dermatology",
    hospital: "Ruby Hall Clinic",
    city: "Pune",
    tier: "C",
  },
  {
    id: "hcp_008",
    name: "Dr. Arjun Patel",
    specialty: "Pulmonology",
    hospital: "Sterling Hospital",
    city: "Ahmedabad",
    tier: "B",
  },
];

const iso = (daysAgo: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const dateOnly = (daysAgo: number) => iso(daysAgo).slice(0, 10);

export const mockInteractions: Interaction[] = [
  {
    id: "int_001",
    hcpId: "hcp_001",
    hcp: mockHCPs[0],
    type: "meeting",
    date: dateOnly(0),
    time: "10:30",
    attendees: ["Amit Verma (Rep)", "Dr. Anika Sharma"],
    topics:
      "Discussed OncoBoost Phase III data. Efficacy in HER2+ patients. Reviewed adverse events profile.",
    materials: [
      { id: "mat_1", name: "OncoBoost Phase III PDF", type: "clinical_paper" },
      { id: "mat_2", name: "Product Brochure v3", type: "brochure" },
    ],
    samples: [{ id: "s_1", productName: "OncoBoost 10mg", quantity: 5 }],
    sentiment: "positive",
    outcomes:
      "Doctor expressed strong interest. Willing to prescribe for eligible patients.",
    followUps: [
      {
        id: "f_1",
        text: "Schedule follow-up meeting in 2 weeks",
        dueDate: dateOnly(-14),
      },
      { id: "f_2", text: "Send OncoBoost Phase III PDF", dueDate: dateOnly(-1) },
    ],
    notes: "Interested in advisory board participation.",
    summary:
      "Positive first-line discussion around OncoBoost with strong prescribing intent.",
    createdAt: iso(0),
    updatedAt: iso(0),
    source: "form",
  },
  {
    id: "int_002",
    hcpId: "hcp_002",
    hcp: mockHCPs[1],
    type: "call",
    date: dateOnly(1),
    time: "15:00",
    attendees: ["Amit Verma (Rep)"],
    topics: "CardioPlus dosing questions in elderly hypertensive patients.",
    materials: [],
    samples: [],
    sentiment: "neutral",
    outcomes: "Requested more clinical evidence before committing.",
    followUps: [
      { id: "f_3", text: "Send NEJM meta-analysis", dueDate: dateOnly(-2) },
    ],
    summary: "Neutral call; needs more evidence before prescribing.",
    createdAt: iso(1),
    updatedAt: iso(1),
    source: "ai",
  },
  {
    id: "int_003",
    hcpId: "hcp_003",
    hcp: mockHCPs[2],
    type: "meeting",
    date: dateOnly(2),
    time: "11:15",
    attendees: ["Amit Verma (Rep)", "Dr. Priya Iyer"],
    topics: "GlucoStar formulary inclusion at Manipal Bengaluru.",
    materials: [{ id: "mat_3", name: "Formulary Kit", type: "slide_deck" }],
    samples: [{ id: "s_2", productName: "GlucoStar 500mg", quantity: 10 }],
    sentiment: "positive",
    outcomes: "Agreed to champion inclusion at P&T committee.",
    followUps: [
      { id: "f_4", text: "Provide P&T committee dossier", dueDate: dateOnly(-3) },
    ],
    createdAt: iso(2),
    updatedAt: iso(2),
    source: "form",
  },
  {
    id: "int_004",
    hcpId: "hcp_004",
    hcp: mockHCPs[3],
    type: "email",
    date: dateOnly(4),
    time: "09:00",
    attendees: ["Amit Verma (Rep)"],
    topics: "NeuroCare launch invitation for regional symposium.",
    materials: [],
    samples: [],
    sentiment: "neutral",
    outcomes: "Will confirm attendance next week.",
    followUps: [],
    createdAt: iso(4),
    updatedAt: iso(4),
    source: "form",
  },
  {
    id: "int_005",
    hcpId: "hcp_005",
    hcp: mockHCPs[4],
    type: "sample_drop",
    date: dateOnly(5),
    time: "14:00",
    attendees: ["Amit Verma (Rep)"],
    topics: "PediaCough sample drop; discussed seasonal demand.",
    materials: [],
    samples: [{ id: "s_3", productName: "PediaCough Syrup", quantity: 20 }],
    sentiment: "positive",
    outcomes: "Doctor will trial with next 10 patients.",
    followUps: [
      { id: "f_5", text: "Check feedback in 3 weeks", dueDate: dateOnly(-21) },
    ],
    createdAt: iso(5),
    updatedAt: iso(5),
    source: "ai",
  },
  {
    id: "int_006",
    hcpId: "hcp_006",
    hcp: mockHCPs[5],
    type: "virtual",
    date: dateOnly(6),
    time: "17:30",
    attendees: ["Amit Verma (Rep)", "Dr. Vikram Nair"],
    topics: "GastroShield II — competitor Alvimopan discussion.",
    materials: [{ id: "mat_4", name: "GastroShield vs Alvimopan", type: "slide_deck" }],
    samples: [],
    sentiment: "negative",
    outcomes: "Prefers competitor due to insurance coverage.",
    followUps: [
      { id: "f_6", text: "Send patient-assistance program info", dueDate: dateOnly(-5) },
    ],
    createdAt: iso(6),
    updatedAt: iso(6),
    source: "form",
  },
];

export const mockUpcoming: DashboardMeeting[] = [
  {
    id: "up_1",
    hcpName: "Dr. Anika Sharma",
    hcpSpecialty: "Oncology",
    type: "meeting",
    date: dateOnly(-1),
    time: "11:00",
    location: "Apollo Hospitals, Mumbai",
  },
  {
    id: "up_2",
    hcpName: "Dr. Rohan Mehta",
    hcpSpecialty: "Cardiology",
    type: "virtual",
    date: dateOnly(-2),
    time: "15:30",
    location: "Google Meet",
  },
  {
    id: "up_3",
    hcpName: "Dr. Priya Iyer",
    hcpSpecialty: "Endocrinology",
    type: "meeting",
    date: dateOnly(-4),
    time: "09:45",
    location: "Manipal Hospitals, Bengaluru",
  },
];

export const mockSuggestions: AISuggestion[] = [
  {
    id: "sg_1",
    hcpName: "Dr. Anika Sharma",
    text: "Schedule follow-up meeting in 2 weeks to reinforce OncoBoost efficacy.",
    createdAt: iso(0),
  },
  {
    id: "sg_2",
    hcpName: "Dr. Rohan Mehta",
    text: "Send CardioPlus NEJM meta-analysis before next touchpoint.",
    createdAt: iso(1),
  },
  {
    id: "sg_3",
    hcpName: "Dr. Vikram Nair",
    text: "Prepare patient-assistance program brief to counter insurance objection.",
    createdAt: iso(2),
  },
];

export function computeDashboard(interactions: Interaction[]): DashboardPayload {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = interactions.filter((i) => i.date === today).length;
  const pending = interactions.reduce(
    (n, i) => n + i.followUps.filter((f) => !f.completed).length,
    0,
  );
  const uniqueHcps = new Set(interactions.map((i) => i.hcpId));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity = days.map((day, idx) => ({
    day,
    interactions: Math.max(1, ((idx * 3 + interactions.length) % 8) + 2),
    followUps: ((idx * 2) % 5) + 1,
  }));

  const sentimentBreakdown = (["positive", "neutral", "negative"] as const).map(
    (s) => ({
      name: s[0].toUpperCase() + s.slice(1),
      value: interactions.filter((i) => i.sentiment === s).length,
    }),
  );

  const typeCounts: Record<string, number> = {};
  interactions.forEach((i) => {
    typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
  });
  const interactionsByType = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  const sorted = [...interactions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return {
    stats: {
      todayCount,
      weekCount: interactions.length,
      pendingFollowUps: pending,
      activeHCPs: uniqueHcps.size,
      todayDelta: 12,
      weekDelta: 8,
    },
    todaysInteractions: interactions.filter((i) => i.date === today),
    recentInteractions: sorted.slice(0, 5),
    upcomingMeetings: mockUpcoming,
    aiSuggestions: mockSuggestions,
    weeklyActivity,
    sentimentBreakdown,
    interactionsByType,
  };
}

export const mockMaterialsCatalog = [
  { id: "mat_1", name: "OncoBoost Phase III PDF", type: "clinical_paper" as const },
  { id: "mat_2", name: "Product Brochure v3", type: "brochure" as const },
  { id: "mat_3", name: "Formulary Kit", type: "slide_deck" as const },
  { id: "mat_4", name: "GastroShield vs Alvimopan", type: "slide_deck" as const },
  { id: "mat_5", name: "Patient Education Video", type: "video" as const },
  { id: "mat_6", name: "NEJM Meta-Analysis", type: "clinical_paper" as const },
];

export const mockProductsCatalog = [
  "OncoBoost 10mg",
  "OncoBoost 25mg",
  "CardioPlus 5mg",
  "GlucoStar 500mg",
  "PediaCough Syrup",
  "GastroShield 20mg",
  "NeuroCare 100mg",
  "DermaClear Cream",
];