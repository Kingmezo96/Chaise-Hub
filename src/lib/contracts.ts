export type ContractMilestone = {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
};

export type ContractProposal = {
  reference: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerRole: string;
  clientEmail: string;
  title: string;
  scope: string;
  contractType: "fixed" | "hourly" | "milestones";
  deadline: string;
  revisions: string;
  hubEnabled: boolean;
  hubLocation: string;
  contractValue: number;
  platformFee: number;
  hubFee: number;
  total: number;
  milestones: ContractMilestone[];
  files: { name: string; size: number }[];
  sentAt: string;
};

export function createSampleProposal(reference: string): ContractProposal {
  const contractValue = 2400;
  const platformFee = contractValue * 0.05;
  return {
    reference,
    freelancerName: "Chibuzo Ogbonnaya",
    freelancerEmail: "chibuzo@chaise.app",
    freelancerRole: "Graphic designer",
    clientEmail: "client@company.com",
    title: "Pro Graphics Designer Vacancy",
    scope: "Create a complete visual identity direction for the brand, including logo refinement, typography, social templates and handoff files. Deliverables include research notes, design concepts, final assets and revision support.",
    contractType: "milestones",
    deadline: "2026-08-28",
    revisions: "2",
    hubEnabled: true,
    hubLocation: "Cafe One · Lekki",
    contractValue,
    platformFee,
    hubFee: contractValue * 0.05,
    total: contractValue * 1.1,
    milestones: [
      { id: "sample-1", title: "Research and design direction", dueDate: "2026-08-01", amount: 600 },
      { id: "sample-2", title: "High-fidelity product design", dueDate: "2026-08-14", amount: 900 },
      { id: "sample-3", title: "Next.js build and handoff", dueDate: "2026-08-28", amount: 900 },
    ],
    files: [
      { name: "project-brief.pdf", size: 1180000 },
      { name: "brand-reference.png", size: 860000 },
    ],
    sentAt: "2026-07-18T16:00:00.000Z",
  };
}
