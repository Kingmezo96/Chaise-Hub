"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ClientProposalBoard } from "@/components/ClientProposalBoard";
import { createSampleProposal, type ContractProposal } from "@/lib/contracts";

type WorkspaceTab = "overview" | "submissions" | "messages" | "payments";
type DashboardTab = "projects" | "transactions";
type ClientNav = "dashboard" | "jobs" | "proposals";
type NegotiationMessage = { id: string; sender: "freelancer" | "client"; name: string; body: string; createdAt: string };

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
const shortDate = (value: string) => new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
const time = (value: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

export function ClientDashboard() {
  const sample = useMemo(() => createSampleProposal("CH-DEMO-001"), []);
  const [proposal, setProposal] = useState<ContractProposal>(sample);
  const [clientName, setClientName] = useState("Chaise Africa");
  const [activeNav, setActiveNav] = useState<ClientNav>("proposals");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("projects");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("overview");
  const [projectOpen, setProjectOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"pending" | "approved" | "revision">("pending");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<NegotiationMessage[]>([
    { id: "workspace-welcome", sender: "freelancer", name: sample.freelancerName, body: "Hi! I’ve started on the research and design direction. I’ll share the first files here for your review.", createdAt: "2026-07-18T16:15:00.000Z" },
  ]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const active = window.localStorage.getItem("kontract:client-active");
      const profile = window.localStorage.getItem("kontract:client-profile");
      if (active) {
        try {
          const parsed = JSON.parse(active) as ContractProposal;
          setProposal(parsed);
          const savedMessages = window.localStorage.getItem(`kontract:messages:${parsed.reference}`);
          if (savedMessages) setMessages(JSON.parse(savedMessages) as NegotiationMessage[]);
        } catch {
          window.localStorage.removeItem("kontract:client-active");
        }
      }
      if (profile) {
        try {
          const parsed = JSON.parse(profile) as { name?: string };
          if (parsed.name) setClientName(parsed.name);
        } catch {
          window.localStorage.removeItem("kontract:client-profile");
        }
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const initials = proposal.freelancerName.split(" ").map((part) => part[0]).slice(0, 2).join("");
  const firstName = clientName.trim() || "Chaise Africa";
  const firstMilestone = proposal.milestones[0];

  const openWorkspace = (tab: WorkspaceTab = "overview") => {
    setActiveNav("dashboard");
    setWorkspaceTab(tab);
    setProjectOpen(true);
    window.requestAnimationFrame(() => document.getElementById("project-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const sendMessage = () => {
    const body = messageInput.trim();
    if (!body) return;
    const next = [...messages, { id: crypto.randomUUID(), sender: "client" as const, name: firstName, body, createdAt: new Date().toISOString() }];
    setMessages(next);
    setMessageInput("");
    window.localStorage.setItem(`kontract:messages:${proposal.reference}`, JSON.stringify(next));
  };

  return (
    <div className="kontract-scope">
      <main className="client-dashboard-shell">
      <header className="client-dashboard-header">
        <Link className="client-dashboard-logo" href="/"><Image src="https://chaise.app/assets/images/chaise_yellow.png" alt="chaise" width={124} height={50} priority /></Link>
        <nav aria-label="Client navigation">
          <button className={activeNav === "dashboard" ? "active" : ""} type="button" onClick={() => { setActiveNav("dashboard"); setDashboardTab("projects"); setProjectOpen(false); }}>Dashboard</button>
          <button className={activeNav === "jobs" ? "active" : ""} type="button" onClick={() => { setActiveNav("jobs"); setProjectOpen(false); }}>My Jobs</button>
          <button className={activeNav === "proposals" ? "active" : ""} type="button" onClick={() => { setActiveNav("proposals"); setProjectOpen(false); }}>Proposals</button>
        </nav>
        <div className="client-dashboard-actions">
          <div className={`client-dashboard-search ${searchOpen ? "open" : ""}`}>
            {searchOpen && <input autoFocus aria-label="Search projects" placeholder="Search projects" />}
            <button type="button" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}><Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon></button>
          </div>
          <button type="button" aria-label="Notifications"><Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon><i /></button>
          <div className="client-dashboard-profile-wrap">
            <button className="client-dashboard-profile" type="button" aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}><span>ch.</span><Icon><path d="m8 10 4 4 4-4" /></Icon></button>
            {profileOpen && <div className="client-profile-popover"><strong>{firstName}</strong><small>Client account</small><button type="button">Complete profile <span>60%</span></button><button type="button">Account settings</button><Link href="/">Sign out</Link></div>}
          </div>
        </div>
      </header>

      <section className="client-dashboard-category">
        <button type="button" aria-label="Previous project"><Icon><path d="m15 18-6-6 6-6" /></Icon></button>
        <strong>{proposal.title}</strong>
        <button type="button" aria-label="Next project"><Icon><path d="m9 18 6-6-6-6" /></Icon></button>
      </section>

      <section className="client-dashboard-main">
        <div className="client-dashboard-welcome"><h1>Welcome back, {firstName}</h1><Link href="/">Post Job</Link></div>

        <section className="client-dashboard-stats" aria-label="Account summary">
          <div><span>Active Project:</span><strong>{activeNav === "dashboard" ? 1 : 0}</strong></div>
          <div><span>Wallet Balance:</span><strong>$0 <Icon><path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10 10 0 0 1 21 12c-.8 1.5-1.9 2.8-3.2 3.8M6.2 6.2A11.5 11.5 0 0 0 3 12a10.6 10.6 0 0 0 10.4 5.9" /></Icon></strong><button className="pale" type="button">Fund wallet <Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
          <div><span>Overall Rating:</span><strong><b>★</b> 0</strong><button type="button">View reviews <Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
          <div><span>Inbox</span><div className="client-dashboard-avatars"><i>CA</i><i className="photo">{initials}</i><i>CH</i></div><button type="button" onClick={() => openWorkspace("messages")}>View messages <Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
        </section>

        {activeNav !== "dashboard" ? (
          <ClientProposalBoard jobTitle={proposal.title} freelancerName={proposal.freelancerName} initials={initials} onView={() => openWorkspace("overview")} />
        ) : <>
        <div className="client-dashboard-tabs" role="tablist"><button className={dashboardTab === "projects" ? "active" : ""} type="button" onClick={() => setDashboardTab("projects")}>Projects</button><button className={dashboardTab === "transactions" ? "active" : ""} type="button" onClick={() => setDashboardTab("transactions")}>Transactions</button></div>

        {dashboardTab === "projects" ? <>
          <div className="client-project-filters"><button className="active" type="button">All (1)</button><button type="button">Active (1)</button><button type="button">Started (1)</button><button type="button">Completed (0)</button><button type="button">Cancelled (0)</button></div>
          <article className="client-active-project">
            <div className="client-active-project-top"><div className="client-project-icon"><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon></div><div><span className="client-status-pill"><i /> In progress</span><h2>{proposal.title}</h2><p>Contract {proposal.reference} · Started 18 Jul 2026</p></div><button type="button" onClick={() => openWorkspace()}>Open project <Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
            <div className="client-project-progress"><div><span>Project progress</span><strong>35%</strong></div><i><b /></i></div>
            <div className="client-project-summary"><div><span>Freelancer</span><strong><i>{initials}</i>{proposal.freelancerName}</strong></div><div><span>Next milestone</span><strong>{firstMilestone?.title || "Project delivery"}</strong><small>Due {firstMilestone ? shortDate(firstMilestone.dueDate) : shortDate(proposal.deadline)}</small></div><div><span>Secured in escrow</span><strong>{money(proposal.total)}</strong><small>USD</small></div><button type="button" onClick={() => openWorkspace("messages")}><Icon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></Icon>Messages</button></div>
          </article>

          {projectOpen && <section className="client-project-workspace" id="project-workspace">
            <div className="client-workspace-heading"><div><button type="button" onClick={() => setProjectOpen(false)}><Icon><path d="m15 18-6-6 6-6" /></Icon>Projects</button><h2>{proposal.title}</h2><p>{proposal.freelancerName} · Contract {proposal.reference}</p></div><span><i /> Active</span></div>
            <div className="client-workspace-tabs">{(["overview", "submissions", "messages", "payments"] as WorkspaceTab[]).map((tab) => <button className={workspaceTab === tab ? "active" : ""} type="button" key={tab} onClick={() => setWorkspaceTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}{tab === "submissions" && <i>1</i>}</button>)}</div>

            {workspaceTab === "overview" && <div className="client-workspace-grid"><article><span className="workspace-kicker">Contract overview</span><h3>Scope of work</h3><p>{proposal.scope}</p><dl><div><dt>Contract type</dt><dd>{proposal.contractType === "milestones" ? "Milestones" : proposal.contractType === "hourly" ? "Hourly rate" : "Fixed price"}</dd></div><div><dt>Deadline</dt><dd>{shortDate(proposal.deadline)}</dd></div><div><dt>Revisions</dt><dd>{proposal.revisions === "unlimited" ? "Unlimited" : proposal.revisions}</dd></div><div><dt>Work location</dt><dd>{proposal.hubEnabled ? proposal.hubLocation : "Remote"}</dd></div></dl></article><aside><span className="workspace-kicker">Milestones</span><h3>Payment schedule</h3>{proposal.milestones.map((milestone, index) => <div className="client-milestone-row" key={milestone.id}><span className={index === 0 ? "active" : ""}>{index === 0 ? "✓" : index + 1}</span><div><strong>{milestone.title}</strong><small>{index === 0 ? "Work in progress" : `Due ${shortDate(milestone.dueDate)}`}</small></div><b>{money(milestone.amount)}</b></div>)}</aside></div>}

            {workspaceTab === "submissions" && <div className="client-submission-panel"><div className="client-submission-header"><div><span className="workspace-kicker">Milestone 1</span><h3>Research and design direction</h3><p>Submitted by {proposal.freelancerName} · Today, 2:34 PM</p></div><span className={`client-review-status ${submissionStatus}`}>{submissionStatus === "pending" ? "Awaiting your review" : submissionStatus === "approved" ? "Approved" : "Revision requested"}</span></div><div className="client-submission-note"><i>{initials}</i><p>Hi {firstName}, I’ve completed the research synthesis and initial design direction. The files include the competitor review, sitemap and the first visual direction.</p></div><div className="client-submission-files"><a href="data:text/plain,Chaise%20project%20submission" download="research-and-direction.pdf"><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon><span><strong>research-and-direction.pdf</strong><small>PDF · 8.2 MB</small></span><Icon><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></Icon></a><a href="data:text/plain,Chaise%20Figma%20preview" download="design-direction.fig"><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon><span><strong>design-direction.fig</strong><small>Figma · 14.6 MB</small></span><Icon><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></Icon></a></div><div className="client-submission-actions"><button type="button" onClick={() => setSubmissionStatus("revision")}>Request revision</button><button type="button" onClick={() => setSubmissionStatus("approved")}><Icon><path d="m5 12 4 4L19 6" /></Icon>Approve milestone</button></div></div>}

            {workspaceTab === "messages" && <div className="client-workspace-messages"><div className="client-message-thread"><div className="client-thread-person"><i>{initials}</i><div><strong>{proposal.freelancerName}</strong><small><b /> Online</small></div></div>{messages.map((message) => <div className={`client-workspace-message ${message.sender}`} key={message.id}><span>{message.sender === "client" ? "You" : message.name}</span><p>{message.body}</p><small>{time(message.createdAt)}</small></div>)}</div><div className="client-workspace-composer"><textarea rows={3} aria-label="Message freelancer" placeholder="Write a message…" value={messageInput} onChange={(event) => setMessageInput(event.target.value)} /><button type="button" onClick={sendMessage} disabled={!messageInput.trim()}><Icon><path d="m21 3-7.5 18-3.6-7-6.9-3.5L21 3Z" /></Icon>Send</button></div></div>}

            {workspaceTab === "payments" && <div className="client-payment-workspace"><article><span className="workspace-kicker">Escrow balance</span><h3>{money(proposal.total)}</h3><p>Secured for this contract</p><div><span><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /></Icon>Protected by Chaise escrow</span></div></article><aside><h3>Payment breakdown</h3><dl><div><dt>Freelancer contract</dt><dd>{money(proposal.contractValue)}</dd></div><div><dt>Chaise service fee</dt><dd>{money(proposal.platformFee)}</dd></div><div><dt>Hub workspace fee</dt><dd>{proposal.hubFee ? money(proposal.hubFee) : "—"}</dd></div><div><dt>Total funded</dt><dd>{money(proposal.total)}</dd></div></dl><button type="button" onClick={() => window.print()}><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Icon>Download receipt</button></aside></div>}
          </section>}
        </> : <section className="client-transactions-panel"><div className="client-transaction-heading"><div><h2>Transactions</h2><p>Payments, escrow funding and releases in USD.</p></div><button type="button" onClick={() => window.print()}><Icon><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></Icon>Export</button></div><div className="client-transaction-row"><div className="client-transaction-icon"><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon></div><div><strong>Escrow funded</strong><small>{proposal.title} · {proposal.reference}</small></div><span>18 Jul 2026</span><b>{money(proposal.total)} USD</b><em>Secured</em></div></section>}
        </>}
      </section>
      </main>
    </div>
  );
}
