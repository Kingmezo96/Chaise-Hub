"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import type { ContractProposal } from "@/lib/contracts";

type ContractType = "fixed" | "hourly" | "milestones";

type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  amount: string;
};

type FieldErrors = Partial<Record<"clientEmail" | "projectTitle" | "scope" | "deadline" | "fixedAmount" | "hourlyRate", string>>;

type InboxMessage = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
};

const createInitialMilestones = (): Milestone[] => [
  { id: "milestone-1", title: "", dueDate: "", amount: "" },
  { id: "milestone-2", title: "", dueDate: "", amount: "" },
];

const formatMoney = (amount: number | string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
};

const nextDay = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
);

export function ContractApp() {
  const workspaceRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contractType, setContractType] = useState<ContractType>("fixed");
  const [clientEmail, setClientEmail] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [scope, setScope] = useState("");
  const [deadline, setDeadline] = useState("");
  const [revisions, setRevisions] = useState("2");
  const [fixedAmount, setFixedAmount] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("20");
  const [milestones, setMilestones] = useState<Milestone[]>(createInitialMilestones);
  const [files, setFiles] = useState<File[]>([]);
  const [hubEnabled, setHubEnabled] = useState(false);
  const [hubLocation, setHubLocation] = useState("Cafe One · Abuja");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [invalidMilestones, setInvalidMilestones] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [reference, setReference] = useState("CH-DC-260718");
  const [toast, setToast] = useState("");
  const [minimumDeadline] = useState(nextDay);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);

  useEffect(() => {
    const refreshInbox = () => {
      try {
        setInboxMessages(JSON.parse(window.localStorage.getItem("kontract:freelancer-inbox") || "[]") as InboxMessage[]);
      } catch {
        window.localStorage.removeItem("kontract:freelancer-inbox");
        setInboxMessages([]);
      }
    };
    const frame = window.requestAnimationFrame(refreshInbox);
    window.addEventListener("storage", refreshInbox);
    window.addEventListener("kontract-inbox-updated", refreshInbox);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refreshInbox);
      window.removeEventListener("kontract-inbox-updated", refreshInbox);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const contractValue = useMemo(() => {
    if (contractType === "fixed") return Number(fixedAmount) || 0;
    if (contractType === "hourly") return (Number(hourlyRate) || 0) * (Number(weeklyHours) || 0);
    return milestones.reduce((sum, milestone) => sum + (Number(milestone.amount) || 0), 0);
  }, [contractType, fixedAmount, hourlyRate, weeklyHours, milestones]);

  const fees = useMemo(() => {
    const platform = contractValue * 0.05;
    const hub = hubEnabled ? contractValue * 0.05 : 0;
    return { value: contractValue, platform, hub, total: contractValue + platform + hub };
  }, [contractValue, hubEnabled]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const clearError = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const goToStep = (nextStep: number) => {
    if (nextStep === 3) setReference(`CH-DC-${String(Date.now()).slice(-6)}`);
    setStep(nextStep);
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const validateStepOne = () => {
    const nextErrors: FieldErrors = {};
    if (!clientEmail.trim()) nextErrors.clientEmail = "Enter your client’s email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) nextErrors.clientEmail = "Enter a valid email address.";
    if (!projectTitle.trim()) nextErrors.projectTitle = "Add a project title.";
    if (!scope.trim()) nextErrors.scope = "Describe the scope of work.";
    if (!deadline) nextErrors.deadline = "Choose a project deadline.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    if (contractType === "fixed") {
      if ((Number(fixedAmount) || 0) < 10) {
        setErrors({ fixedAmount: "Enter a project amount of at least $10." });
        return false;
      }
      setErrors({});
      return true;
    }
    if (contractType === "hourly") {
      if ((Number(hourlyRate) || 0) < 1) {
        setErrors({ hourlyRate: "Enter an hourly rate of at least $1." });
        return false;
      }
      setErrors({});
      return true;
    }
    const invalid = milestones
      .filter((milestone) => !milestone.title.trim() || !milestone.dueDate || (Number(milestone.amount) || 0) < 10)
      .map((milestone) => milestone.id);
    setInvalidMilestones(invalid);
    if (invalid.length) showToast("Complete every milestone before continuing");
    return invalid.length === 0;
  };

  const continueFromStepOne = () => {
    if (validateStepOne()) goToStep(2);
  };

  const continueFromStepTwo = () => {
    if (validateStepTwo()) goToStep(3);
  };

  const updateMilestone = (id: string, field: keyof Omit<Milestone, "id">, value: string) => {
    setMilestones((current) => current.map((milestone) => (milestone.id === id ? { ...milestone, [field]: value } : milestone)));
    setInvalidMilestones((current) => current.filter((item) => item !== id));
  };

  const addMilestone = () => {
    setMilestones((current) => [...current, { id: crypto.randomUUID(), title: "", dueDate: "", amount: "" }]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length === 1) {
      showToast("A milestone contract needs at least one milestone");
      return;
    }
    setMilestones((current) => current.filter((milestone) => milestone.id !== id));
  };

  const addFiles = (incomingFiles: FileList | File[]) => {
    const incoming = Array.from(incomingFiles);
    const accepted: File[] = [];
    incoming.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} is larger than 10 MB`);
      } else {
        accepted.push(file);
      }
    });
    setFiles((current) => {
      const unique = accepted.filter((file) => !current.some((item) => item.name === file.name && item.size === file.size));
      return [...current, ...unique];
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const sendContract = () => {
    if (!consent) {
      setConsentError("Confirm the contract details before sending.");
      return;
    }
    setConsentError("");
    const proposal: ContractProposal = {
      reference,
      freelancerName: "Chibuzo Ogbonnaya",
      freelancerEmail: "chibuzo@chaise.app",
      freelancerRole: "Product designer & web developer",
      clientEmail,
      title: projectTitle,
      scope,
      contractType,
      deadline,
      revisions,
      hubEnabled,
      hubLocation,
      contractValue: fees.value,
      platformFee: fees.platform,
      hubFee: fees.hub,
      total: fees.total,
      milestones: contractType === "milestones" ? milestones.map((milestone) => ({ ...milestone, amount: Number(milestone.amount) || 0 })) : [],
      files: files.map((file) => ({ name: file.name, size: file.size })),
      sentAt: new Date().toISOString(),
    };
    window.localStorage.setItem(`kontract:${reference}`, JSON.stringify(proposal));
    setSent(true);
    requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(`/c/${reference}`, window.location.origin).toString());
      showToast("Contract link copied");
    } catch {
      showToast("Copy the link from the box above");
    }
  };

  const resetContract = () => {
    setStep(1);
    setSent(false);
    setContractType("fixed");
    setClientEmail("");
    setProjectTitle("");
    setScope("");
    setDeadline("");
    setRevisions("2");
    setFixedAmount("");
    setHourlyRate("");
    setWeeklyHours("20");
    setMilestones(createInitialMilestones());
    setFiles([]);
    setHubEnabled(false);
    setHubLocation("Cafe One · Abuja");
    setErrors({});
    setInvalidMilestones([]);
    setConsent(false);
    setConsentError("");
    setReference("CH-DC-260718");
  };

  const revisionLabel = revisions === "unlimited" ? "Unlimited" : `${revisions} revision${revisions === "1" ? "" : "s"}`;

  return (
    <div className="kontract-scope">
      <main className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
        </button>

        <Link className="brand" href="/" aria-label="Chaise home">
          chaise<span>.</span>
        </Link>

        <nav className={`primary-nav top-navigation${mobileMenuOpen ? " open is-open" : ""}`} aria-label="Primary navigation">
          {[
            "Find Jobs",
            "Dashboard",
            "Proposals",
            "Messages",
            "Wallet",
            "Hub",
          ].map((item) =>
            item === "Hub" ? (
              <Link href="/" key={item} onClick={() => setMobileMenuOpen(false)}>{item}</Link>
            ) : (
              <a href="#contract" key={item} onClick={() => setMobileMenuOpen(false)}>{item}</a>
            ),
          )}
          <Link className="active" href="/contract" aria-current="page" onClick={() => setMobileMenuOpen(false)}>Contract</Link>
        </nav>
        <div className="topbar-actions top-actions">
          <button className="icon-button" type="button" aria-label="Search"><Icon><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Icon></button>
          <button className="icon-button notification-button" type="button" aria-label="Notifications"><Icon><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9Z" /><path d="M9.6 21h4.8" /></Icon><span /></button>
          <button className="profile-menu profile-button" type="button" aria-label="Open profile menu"><span className="profile-mark">CO</span><Icon><path d="m8 10 4 4 4-4" /></Icon></button>
        </div>
      </header>

      <nav className="category-nav" aria-label="Job categories">
        <button type="button" aria-label="Previous categories"><Icon><path d="m15 18-6-6 6-6" /></Icon></button>
        <div className="category-track">
          {["Accounting & consulting", "Admin support", "Customer service", "Data science and analytics", "Design & creative", "Engineering & architecture", "IT & networking", "Legal", "Sales and marketing"].map((item) => <a href="#contract" key={item}>{item}</a>)}
        </div>
        <button type="button" aria-label="Next categories"><Icon><path d="m9 18 6-6-6-6" /></Icon></button>
      </nav>

      <div className="page-grid">
        <aside className="sidebar">
          <section className="profile-card card">
            <div className="avatar" aria-hidden="true"><span>Mezo</span></div>
            <h2>Chibuzo Ogbonnaya</h2>
            <button className="secondary-button full-width" type="button">View profile</button>
          </section>
          <section className="availability-card card">
            <div className="card-row"><strong>Availability</strong><label className="switch" aria-label="Availability"><input type="checkbox" defaultChecked /><span /></label></div>
            <p>While unavailable, your Gigs are hidden and you will not receive new orders.</p>
          </section>
          <section className="messages-card card">
            <div className="card-row"><strong>Messages</strong>{inboxMessages.length > 0 && <span className="message-count">{inboxMessages.length}</span>}</div>
            {inboxMessages.length > 0 ? <div className="messages-list">{inboxMessages.slice(0, 3).map((message) => <button type="button" key={message.id}><span className="message-sender">{message.name.slice(0, 2).toUpperCase()}</span><span><strong>{message.name}</strong><small>{message.body}</small></span></button>)}<a href="#contract">Open contract inbox</a></div> : <div className="messages-empty"><Icon><path d="M5 5h14v11H9l-4 3V5Z" /></Icon><span>No messages yet</span><a href="#contract">Open inbox</a></div>}
          </section>
        </aside>

        <section className="contract-workspace" id="contract" ref={workspaceRef}>
          <div className="workspace-heading">
            <div><span className="eyebrow">Direct contract</span><h1>Create a contract</h1><p>Bring your client to Chaise and let us handle payments, escrow and project protection.</p></div>
            <div className="secure-pill"><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>Secure escrow</div>
          </div>

          {!sent && (
            <ol className="stepper" aria-label="Contract progress">
              {[{ number: 1, title: "Contract details", subtitle: "Client & project" }, { number: 2, title: "Terms & fees", subtitle: "Price & workspace" }, { number: 3, title: "Review & send", subtitle: "Preview contract" }].map((item) => (
                <li key={item.number} className={step === item.number ? "active" : step > item.number ? "complete" : ""}>
                  <span>{item.number}</span><div><strong>{item.title}</strong><small>{item.subtitle}</small></div>
                </li>
              ))}
            </ol>
          )}

          {!sent && (
            <form id="contract-form" noValidate onSubmit={(event) => event.preventDefault()}>
              <section className={`form-step card${step === 1 ? " active" : ""}`} data-step="1">
                <div className="section-heading"><div><span className="step-label">Step 1</span><h2>Tell us about the project</h2><p>Start with your client and the work you have agreed to do.</p></div></div>
                <div className="field-grid two-columns">
                  <label className={`field${errors.clientEmail ? " invalid" : ""}`}>
                    <span>Client email address</span>
                    <input type="email" value={clientEmail} onChange={(event) => { setClientEmail(event.target.value); clearError("clientEmail"); }} placeholder="client@company.com" autoComplete="email" required />
                    <small>We’ll send the contract and funding instructions here.</small><em className="error-message">{errors.clientEmail}</em>
                  </label>
                  <label className={`field${errors.projectTitle ? " invalid" : ""}`}>
                    <span>Project title</span>
                    <input type="text" value={projectTitle} onChange={(event) => { setProjectTitle(event.target.value); clearError("projectTitle"); }} placeholder="e.g. E-commerce website redesign" maxLength={90} required />
                    <small><b>{projectTitle.length}</b>/90 characters</small><em className="error-message">{errors.projectTitle}</em>
                  </label>
                </div>
                <fieldset className="field contract-type-fieldset">
                  <legend>Contract type</legend>
                  <div className="option-cards three-columns">
                    {([
                      { value: "fixed", title: "Fixed price", copy: "One price for the full project", icon: <><path d="M4 7h16v11H4z" /><path d="M8 7V5h8v2M8 12h8" /></> },
                      { value: "hourly", title: "Hourly rate", copy: "Bill for approved time worked", icon: <><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></> },
                      { value: "milestones", title: "Milestones", copy: "Split work into funded stages", icon: <><path d="M5 5h14v4H5zM5 15h14v4H5z" /><path d="M9 9v6m6-6v6" /></> },
                    ] as const).map((option) => (
                      <label className={`option-card${contractType === option.value ? " selected" : ""}`} key={option.value}>
                        <input type="radio" name="contractType" value={option.value} checked={contractType === option.value} onChange={() => setContractType(option.value)} />
                        <span className="radio-mark" /><span className="option-icon"><Icon>{option.icon}</Icon></span><strong>{option.title}</strong><small>{option.copy}</small>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className={`field${errors.scope ? " invalid" : ""}`}>
                  <span>Scope of work</span>
                  <textarea rows={7} value={scope} onChange={(event) => { setScope(event.target.value); clearError("scope"); }} maxLength={2000} placeholder="Describe the deliverables, expectations and what is included in the project..." required />
                  <small><b>{scope.length.toLocaleString()}</b>/2,000 characters</small><em className="error-message">{errors.scope}</em>
                </label>
                <div className="field">
                  <span>Reference files <i>(optional)</i></span>
                  <label className="upload-area" htmlFor="reference-files" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
                    <input id="reference-files" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileChange} />
                    <span className="upload-icon"><Icon><path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M5 14v5h14v-5" /></Icon></span>
                    <strong>Drop files here or <u>browse</u></strong><small>PNG, JPG, PDF or DOCX · 10 MB each</small>
                  </label>
                  <div className="file-list" aria-live="polite">
                    {files.map((file, index) => (
                      <div className="file-chip" key={`${file.name}-${file.size}`}>
                        <Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon>
                        <div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div>
                        <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`}><Icon><path d="m7 7 10 10M17 7 7 17" /></Icon></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="field-grid two-columns compact-fields">
                  <label className={`field${errors.deadline ? " invalid" : ""}`}><span>Project deadline</span><input type="date" min={minimumDeadline} value={deadline} onChange={(event) => { setDeadline(event.target.value); clearError("deadline"); }} required /><em className="error-message">{errors.deadline}</em></label>
                  <label className="field"><span>Number of revisions</span><select value={revisions} onChange={(event) => setRevisions(event.target.value)}><option value="0">No revisions</option><option value="1">1 revision</option><option value="2">2 revisions</option><option value="3">3 revisions</option><option value="4">4 revisions</option><option value="unlimited">Unlimited revisions</option></select></label>
                </div>
                <div className="form-actions end"><button className="primary-button" type="button" onClick={continueFromStepOne}>Continue to terms<Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
              </section>

              <section className={`form-step card${step === 2 ? " active" : ""}`} data-step="2">
                <div className="section-heading"><div><span className="step-label">Step 2</span><h2>Set your terms</h2><p>Choose the payment structure and whether you’ll work from a Chaise Hub.</p></div></div>
                <div className={`pricing-panel${contractType === "fixed" ? " active" : ""}`}>
                  <label className={`field amount-field${errors.fixedAmount ? " invalid" : ""}`}><span>Project amount</span><div className="money-input"><b>USD</b><input type="number" min="10" step="0.01" value={fixedAmount} onChange={(event) => { setFixedAmount(event.target.value); clearError("fixedAmount"); }} placeholder="0.00" /></div><small>The full project amount held securely in escrow.</small><em className="error-message">{errors.fixedAmount}</em></label>
                </div>
                <div className={`pricing-panel${contractType === "hourly" ? " active" : ""}`}>
                  <div className="field-grid two-columns">
                    <label className={`field amount-field${errors.hourlyRate ? " invalid" : ""}`}><span>Hourly rate</span><div className="money-input"><b>USD</b><input type="number" min="1" step="0.01" value={hourlyRate} onChange={(event) => { setHourlyRate(event.target.value); clearError("hourlyRate"); }} placeholder="0.00" /></div><em className="error-message">{errors.hourlyRate}</em></label>
                    <label className="field"><span>Weekly hour limit</span><div className="suffix-input"><input type="number" min="1" max="80" value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} /><b>hours</b></div><small>Maximum billable hours per week.</small></label>
                  </div>
                  <div className="hourly-estimate note-box"><span>Estimated weekly budget</span><strong>{formatMoney((Number(hourlyRate) || 0) * (Number(weeklyHours) || 0))}</strong></div>
                </div>
                <div className={`pricing-panel${contractType === "milestones" ? " active" : ""}`}>
                  <div className="milestone-heading"><div><h3>Project milestones</h3><p>Each stage is funded before work begins.</p></div><button className="small-outline-button" type="button" onClick={addMilestone}><Icon><path d="M12 5v14M5 12h14" /></Icon>Add milestone</button></div>
                  <div>
                    {milestones.map((milestone, index) => (
                      <div className={`milestone-item${invalidMilestones.includes(milestone.id) ? " milestone-invalid" : ""}`} key={milestone.id}>
                        <span className="milestone-number">{index + 1}</span>
                        <label className="field milestone-title"><span>Milestone title</span><input type="text" value={milestone.title} onChange={(event) => updateMilestone(milestone.id, "title", event.target.value)} placeholder="e.g. Design concepts" /></label>
                        <label className="field milestone-date"><span>Due date</span><input type="date" min={minimumDeadline} value={milestone.dueDate} onChange={(event) => updateMilestone(milestone.id, "dueDate", event.target.value)} /></label>
                        <label className="field milestone-amount"><span>Amount</span><div className="money-input"><b>USD</b><input type="number" min="10" step="0.01" value={milestone.amount} onChange={(event) => updateMilestone(milestone.id, "amount", event.target.value)} placeholder="0.00" /></div></label>
                        <button className="remove-milestone" type="button" onClick={() => removeMilestone(milestone.id)} aria-label={`Remove milestone ${index + 1}`}><Icon><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" /></Icon></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hub-choice">
                  <div className="hub-choice-copy"><span className="hub-symbol"><Icon><path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6" /></Icon></span><div><span className="optional-tag">Optional</span><h3>Work at a Chaise Hub</h3><p>Add a verified workspace, focused environment and secure project check-in for an extra 5%.</p></div></div>
                  <label className="switch large" aria-label="Work at a Chaise Hub"><input type="checkbox" checked={hubEnabled} onChange={(event) => setHubEnabled(event.target.checked)} /><span /></label>
                </div>
                <div className={`hub-selector${hubEnabled ? " open" : ""}`} aria-hidden={!hubEnabled}>
                  <label className="field"><span>Preferred hub location</span><select value={hubLocation} disabled={!hubEnabled} onChange={(event) => setHubLocation(event.target.value)}><option>Cafe One · Abuja</option><option>Cafe One · Lekki</option><option>Cafe One · Yaba</option><option>Cafe One · Port Harcourt</option><option>Workstation · Lagos VI</option><option>Ventures Park · Abuja</option></select></label>
                  <div className="hub-note"><Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></Icon>You’ll choose your exact work dates after the client funds the contract.</div>
                </div>
                <aside className="fee-card" aria-label="Contract fee summary">
                  <div className="fee-card-title"><div><span>Fee summary</span><small>Transparent protection for you and your client</small></div><span className="escrow-badge">Escrow protected</span></div>
                  <dl><div><dt>Contract value</dt><dd>{formatMoney(fees.value)}</dd></div><div><dt>Chaise service fee <span>5%</span></dt><dd>{formatMoney(fees.platform)}</dd></div><div className={hubEnabled ? "" : "muted-row"}><dt>Hub workspace fee <span>+5%</span></dt><dd>{hubEnabled ? formatMoney(fees.hub) : "Not added"}</dd></div><div className="fee-total"><dt>Total client funds</dt><dd>{formatMoney(fees.total)}</dd></div></dl>
                  <p>The contract value is reserved for your work. Applicable fees are shown to the client before funding.</p>
                </aside>
                <div className="form-actions between"><button className="text-button" type="button" onClick={() => goToStep(1)}><Icon><path d="m15 18-6-6 6-6" /></Icon>Back</button><button className="primary-button" type="button" onClick={continueFromStepTwo}>Preview contract<Icon><path d="m9 18 6-6-6-6" /></Icon></button></div>
              </section>

              <section className={`form-step${step === 3 ? " active" : ""}`} data-step="3">
                <div className="preview-layout">
                  <article className="contract-preview card">
                    <div className="preview-header"><div><a className="brand preview-brand" href="#contract" tabIndex={-1}><Image src="https://chaise.app/assets/images/chaise_yellow.png" alt="chaise" width={81} height={32} /></a><span className="contract-status">Awaiting client</span></div><div className="contract-ref">DIRECT CONTRACT<br /><strong>{reference}</strong></div></div>
                    <div className="preview-title-block"><span>Project</span><h2>{projectTitle || "Untitled project"}</h2><p>Prepared for <strong>{clientEmail || "—"}</strong></p></div>
                    <div className="preview-section"><h3>Scope of work</h3><p>{scope || "—"}</p></div>
                    <div className="preview-facts"><div><span>Contract type</span><strong>{{ fixed: "Fixed price", hourly: "Hourly rate", milestones: "Milestones" }[contractType]}</strong></div><div><span>Deadline</span><strong>{formatDate(deadline)}</strong></div><div><span>Revisions</span><strong>{revisionLabel}</strong></div><div><span>Workspace</span><strong>{hubEnabled ? hubLocation : "Not included"}</strong></div></div>
                    <div className="preview-section"><h3>Payment schedule</h3><div>
                      {contractType === "milestones" ? milestones.map((milestone, index) => <div className="payment-line" key={milestone.id}><span>{index + 1}</span><div><strong>{milestone.title}</strong><small>Due {formatDate(milestone.dueDate)}</small></div><b>{formatMoney(milestone.amount)}</b></div>) : contractType === "hourly" ? <div className="payment-line"><span>1</span><div><strong>{formatMoney(hourlyRate)} per hour</strong><small>Up to {weeklyHours} hours each week</small></div><b>{formatMoney(contractValue)}/wk</b></div> : <div className="payment-line"><span>1</span><div><strong>Full project payment</strong><small>Funded before work begins</small></div><b>{formatMoney(fees.value)}</b></div>}
                    </div></div>
                    {files.length > 0 && <div className="preview-section reference-section"><h3>Reference files</h3><div>{files.map((file) => <span className="preview-file-chip" key={`${file.name}-${file.size}`}><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon>{file.name}</span>)}</div></div>}
                    <div className="preview-assurance"><span><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon></span><div><strong>Protected by Chaise escrow</strong><p>Funds are held securely and released according to the approved contract terms.</p></div></div>
                  </article>
                  <aside className="send-panel card">
                    <span className="step-label">Final step</span><h2>Ready to send?</h2><p>Your client can review, accept and securely fund this contract.</p>
                    <dl className="send-summary"><div><dt>Contract value</dt><dd>{formatMoney(fees.value)}</dd></div><div><dt>Chaise service fee</dt><dd>{formatMoney(fees.platform)}</dd></div><div className={hubEnabled ? "" : "muted-row"}><dt>Hub workspace fee</dt><dd>{hubEnabled ? formatMoney(fees.hub) : "Not added"}</dd></div><div><dt>Total to fund</dt><dd>{formatMoney(fees.total)}</dd></div></dl>
                    <label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setConsentError(""); }} /><span>I confirm that the contract details are accurate and agree to the <a href="#contract">direct contract terms</a>.</span></label>
                    <em className="consent-error">{consentError}</em>
                    <button className="primary-button full-width" type="button" onClick={sendContract}>Send to client<Icon><path d="m21 3-7.5 18-3.6-7-6.9-3.5L21 3Z" /><path d="m10 14 4-4" /></Icon></button>
                    <button className="secondary-button full-width" type="button" onClick={() => window.print()}><Icon><path d="M7 8V3h10v5M7 17H4v-7h16v7h-3M7 14h10v7H7z" /></Icon>Download preview</button>
                  </aside>
                </div>
                <div className="form-actions start preview-back-action"><button className="text-button" type="button" onClick={() => goToStep(2)}><Icon><path d="m15 18-6-6 6-6" /></Icon>Edit contract</button></div>
              </section>
            </form>
          )}

          {sent && (
            <section className="success-screen card active" aria-live="polite">
              <div className="success-icon"><Icon><path d="m5 12 4 4L19 6" /></Icon></div><span className="eyebrow">Contract sent</span><h2>Your client is one step away</h2><p>We sent the contract to <strong>{clientEmail}</strong>. You’ll be notified once it is accepted and funded.</p>
              <div className="success-details"><div><span>Contract reference</span><strong>{reference}</strong></div><div><span>Amount to fund</span><strong>{formatMoney(fees.total)}</strong></div><div><span>Status</span><strong className="status-awaiting">Awaiting client</strong></div></div>
              <div className="share-box"><div><span>Shareable contract link</span><a href={`/c/${reference}`}><strong>/c/{reference}</strong></a></div><button className="secondary-button" type="button" onClick={copyLink}>Copy link</button></div>
              <button className="primary-button" type="button" onClick={resetContract}>Create another contract</button>
            </section>
          )}
        </section>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
      </main>
    </div>
  );
}
