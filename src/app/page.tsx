"use client";

import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  FileText,
  MapPin,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { FormEvent, useMemo, useState } from "react";

type Milestone = {
  id: number;
  title: string;
  dueDate: string;
  paymentAmount: number;
};

type PassDetails = {
  code: string;
  projectName: string;
  hubName: string;
  workDate: string;
  time: string;
  firstMilestonePayment: number;
  serviceFee: number;
};

type HubOption = {
  group: "Cafe One by Sterling" | "Other Nigerian work hubs";
  label: string;
};

const cafeOneHubs: HubOption[] = [
  { group: "Cafe One by Sterling", label: "Cafe One · Abuja — 1st Floor, Sterling Bank Plaza, CBD Abuja, FCT" },
  { group: "Cafe One by Sterling", label: "Cafe One · Uyo — 162 Oron Road, Uyo, Akwa Ibom" },
  { group: "Cafe One by Sterling", label: "Cafe One · Calabar — State Library, beside Stadium Pool Side, Calabar Road" },
  { group: "Cafe One by Sterling", label: "Cafe One · Asaba — Sterling Bank Building, Umuagu Quarters, Nnebisi Road" },
  { group: "Cafe One by Sterling", label: "Cafe One · Asaba Nnebisi — Umuagu Quarters, Nnebisi Road, Asaba" },
  { group: "Cafe One by Sterling", label: "Cafe One · Ado Ekiti — Bank Road, by New Iyin Road, Ado Ekiti" },
  { group: "Cafe One by Sterling", label: "Cafe One · Enugu — 22 Okpara Avenue, Achara, CCB Building" },
  { group: "Cafe One by Sterling", label: "Cafe One · Owerri — Meksky Plaza, 24 Ikenegbu Layout, Owerri" },
  { group: "Cafe One by Sterling", label: "Cafe One · Kaduna — Uptown Mall, Zaire Road, Barnawa, Kaduna" },
  { group: "Cafe One by Sterling", label: "Cafe One · Kano Kofar Ruwa — Aminu Dantata Estate, Kofar Ruwa Market" },
  { group: "Cafe One by Sterling", label: "Cafe One · Kano MM Way — 110 Murtala Mohammad Way, Kano" },
  { group: "Cafe One by Sterling", label: "Cafe One · Adebola House — 38 Opebi Road, Ikeja, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Adeniran Ogunsanya — 74 Adeniran Ogunsanya Street, Surulere, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Adeola Odeku — 300 Adeola Odeku Street, Victoria Island, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Ajah — Ocean Mall, Plot 50, Lekki-Epe Expressway, Olokonla Bus Stop" },
  { group: "Cafe One by Sterling", label: "Cafe One · Chevron — 4th Floor, King's Deck Plaza, Chevron Drive, Lekki" },
  { group: "Cafe One by Sterling", label: "Cafe One · Dopemu — Shasha Road, Akowonjo, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Herbert Macaulay — Sterling Bank Building, 260 Herbert Macaulay Way, Yaba" },
  { group: "Cafe One by Sterling", label: "Cafe One · Iganmu — Plot 2-4 Abebe Village Road, Iganmu, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Ikate — 10 Nike Art Gallery Road, Ikate, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Ikeja — Ikeja Town Square, Obafemi Awolowo Way, Ikeja" },
  { group: "Cafe One by Sterling", label: "Cafe One · LASU — Lagos State University, Ojo, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Lekki — 21 Admiralty Way, Lekki Phase 1, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Marina — 20 Marina, Lagos Island" },
  { group: "Cafe One by Sterling", label: "Cafe One · Ogudu — 123 Ogudu Road, Ojota, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · One Haven — Lagos Mainland" },
  { group: "Cafe One by Sterling", label: "Cafe One · Oregun — 3 Kudirat Abiola Way, Oregun, Lagos" },
  { group: "Cafe One by Sterling", label: "Cafe One · Unilag — UNILAG Bookshop Building, Main Campus, Akoka, Yaba" },
  { group: "Cafe One by Sterling", label: "Cafe One · Universal — All Access" },
  { group: "Cafe One by Sterling", label: "Cafe One · Yaba — 3rd Floor, E-Centre, 1-11 Commercial Avenue, Yaba" },
  { group: "Cafe One by Sterling", label: "Cafe One · Oshogbo — KM 3 Ibadan-Gbongan Road, Oshogbo, Osun" },
  { group: "Cafe One by Sterling", label: "Cafe One · Challenge — 97 Lagos Road, Challenge, Ibadan" },
  { group: "Cafe One by Sterling", label: "Cafe One · Iwo Road — 49A Sterling Bank Building, Abayomi Aba Junction, Iwo Road" },
  { group: "Cafe One by Sterling", label: "Cafe One · Palms Mall Ibadan — The Palms Shopping Mall, Ring Road, Ibadan" },
  { group: "Cafe One by Sterling", label: "Cafe One · Port Harcourt — Deborah Lawson House, Off Sani Abacha Road, GRA Phase 3" },
];

const partnerHubs: HubOption[] = [
  { group: "Other Nigerian work hubs", label: "Ventures Park · Abuja — 5 Kwaji Close, Maitama" },
  { group: "Other Nigerian work hubs", label: "Seedbuilders Innovation Hub · Abuja — 6A Embu Street, off Aminu Kano Crescent, Wuse 2" },
  { group: "Other Nigerian work hubs", label: "Regus · Abuja City Centre — Central Business District" },
  { group: "Other Nigerian work hubs", label: "HQ · Abuja Garki II — 28 Okemesi Crescent, Garki II" },
  { group: "Other Nigerian work hubs", label: "Workstation · Lagos VI — Victoria Island, Lagos" },
  { group: "Other Nigerian work hubs", label: "Workstation · Lagos Maryland — Maryland Mall, Lagos" },
  { group: "Other Nigerian work hubs", label: "Spaces · Lagos — Victoria Island, Ikeja and Lekki flexible workspaces" },
  { group: "Other Nigerian work hubs", label: "Regus · Lagos — Victoria Island, Ikeja and Lekki coworking locations" },
  { group: "Other Nigerian work hubs", label: "Zahari Workspace · Lagos — Lekki" },
  { group: "Other Nigerian work hubs", label: "Pause Cafe · Lagos — The Palms Shopping Mall, Maroko, Lekki" },
  { group: "Other Nigerian work hubs", label: "Olotu Square · Port Harcourt — 31 Isiokpo Street, D/Line" },
  { group: "Other Nigerian work hubs", label: "HUB10 · Port Harcourt — 5 Chief Ehule Lane, off Ada George Road" },
  { group: "Other Nigerian work hubs", label: "Regus · Port Harcourt Trans Amadi — Old Michelin Compound" },
  { group: "Other Nigerian work hubs", label: "Regus · Port Harcourt PH Tower — 37 Aba Road" },
  { group: "Other Nigerian work hubs", label: "OFFICEBOX · Kano — Ahmadu Bello Way, Kano" },
  { group: "Other Nigerian work hubs", label: "Startup Kano · Kano — Maiduguri Road, near Azman Filling Station" },
  { group: "Other Nigerian work hubs", label: "HQ · Kano Zoo Road — 32 Zoo Road, Kano" },
];

const hubs = [...cafeOneHubs, ...partnerHubs];

const topNavigation = ["Find Jobs", "Dashboard", "Proposals", "Messages", "Wallet", "Hub", "Contract"];

const categories = [
  "Accounting & consulting",
  "Admin support",
  "Customer service",
  "Data science and analytics",
  "Design & creative",
  "Engineering & architecture",
  "IT & networking",
  "Legal",
  "Sales and marketing",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "Not selected";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatHubName(value: string) {
  return value.split(" — ")[0].replace(/^Cafe One · /, "").replace(/^(.+?) · /, "$1 — ");
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="field-label">
      {children}
      {optional ? <span>Optional</span> : null}
    </label>
  );
}

function Step({ number, label, active, done }: { number: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className={`step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
      <span className="step-number">{done ? <Check size={15} strokeWidth={3} /> : number}</span>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [projectName, setProjectName] = useState("NovaPay brand identity rollout");
  const [projectDetails, setProjectDetails] = useState(
    "Complete the final brand guidelines, social templates, and handover files for the client.",
  );
  const [startDate, setStartDate] = useState("2026-07-20");
  const [endDate, setEndDate] = useState("2026-08-14");
  const [projectValue, setProjectValue] = useState(450000);
  const [hubName, setHubName] = useState(hubs[0].label);
  const [workDate, setWorkDate] = useState("2026-07-24");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, title: "Client review and final revisions", dueDate: "2026-07-30", paymentAmount: 225000 },
    { id: 2, title: "Final files and brand handover", dueDate: "2026-08-14", paymentAmount: 225000 },
  ]);
  const [feeAccepted, setFeeAccepted] = useState(false);
  const [formError, setFormError] = useState("");
  const [pass, setPass] = useState<PassDetails | null>(null);
  const [copied, setCopied] = useState(false);

  const serviceFee = useMemo(() => projectValue * 0.05, [projectValue]);
  const firstMilestonePayment = milestones[0]?.paymentAmount || 0;
  const firstMilestoneBalance = Math.max(firstMilestonePayment - serviceFee, 0);
  const totalMilestonePayments = useMemo(
    () => milestones.reduce((total, milestone) => total + (milestone.paymentAmount || 0), 0),
    [milestones],
  );

  function addMilestone() {
    setMilestones((current) => [
      ...current,
      { id: Date.now(), title: "", dueDate: endDate, paymentAmount: 0 },
    ]);
  }

  function updateMilestone(id: number, key: "title" | "dueDate" | "paymentAmount", value: string | number) {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === id ? { ...milestone, [key]: value } : milestone,
      ),
    );
  }

  function removeMilestone(id: number) {
    setMilestones((current) => current.filter((milestone) => milestone.id !== id));
  }

  function proceedToHubSelection() {
    if (!projectName.trim() || !projectDetails.trim() || !startDate || !endDate) {
      setFormError("Please complete the required project details before choosing a hub.");
      return;
    }

    setFormError("");
    document.getElementById("hub-selection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function generatePass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectName.trim() || !projectDetails.trim() || !startDate || !endDate || !workDate) {
      setFormError("Please complete the required project and booking details.");
      return;
    }

    if (!feeAccepted) {
      setFormError("Please accept the 5% Chaise Hub service fee to continue.");
      return;
    }

    const code = `CH-HUB-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    setPass({
      code,
      projectName,
      hubName,
      workDate,
      time: `${startTime} – ${endTime}`,
      firstMilestonePayment,
      serviceFee,
    });
    setFormError("");
    setCopied(false);
  }

  async function copyCode() {
    if (!pass) return;
    await navigator.clipboard.writeText(pass.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadQr() {
    const canvas = document.getElementById("hub-pass-qr") as HTMLCanvasElement | null;
    if (!canvas || !pass) return;
    const link = document.createElement("a");
    link.download = `${pass.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const qrValue = pass
    ? JSON.stringify({
        code: pass.code,
        project: pass.projectName,
        hub: pass.hubName,
        date: pass.workDate,
        time: pass.time,
        firstMilestonePayment: pass.firstMilestonePayment,
        hubFeeDeducted: pass.serviceFee,
      })
    : "";

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileNavOpen((value) => !value)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <a className="brand" href="#" aria-label="Chaise home">
          chaise<span>.</span>
        </a>

        <nav className={`top-navigation ${mobileNavOpen ? "is-open" : ""}`} aria-label="Primary">
          {topNavigation.map((item) => (
            <a className={item === "Hub" ? "active" : ""} href={item === "Contract" ? "/contract" : "#hub-booking"} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="top-actions">
          <button type="button" aria-label="Search"><Search size={19} /></button>
          <button type="button" aria-label="Notifications" className="notification-button">
            <Bell size={19} />
            <span />
          </button>
          <button className="profile-button" type="button" aria-label="Open profile menu">
            <span>CO</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <nav className="category-bar" aria-label="Job categories">
        <button type="button" aria-label="Previous categories"><ChevronLeft size={22} /></button>
        <div className="category-list">
          {categories.map((category) => <a href="#" key={category}>{category}</a>)}
        </div>
        <button type="button" aria-label="Next categories"><ChevronRight size={22} /></button>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <section className="profile-card">
            <div className="profile-avatar">CO</div>
            <div>
              <strong>Chibuzo Ogbonnaya</strong>
              <span>Brand & product designer</span>
            </div>
            <button type="button">View profile</button>
          </section>

          <section className="availability-card">
            <div>
              <strong>Availability</strong>
              <span className="availability-toggle" aria-label="Available"><span /></span>
            </div>
            <p>While unavailable, your hub bookings are paused and you will not receive new workspace offers.</p>
          </section>

          <section className="messages-card">
            <strong>Messages</strong>
            <div>
              <MessageSquareText size={27} strokeWidth={1.6} />
              <span>No messages yet</span>
              <a href="#">Open inbox</a>
            </div>
          </section>
        </aside>

        <section className="content" id="hub-booking">
          <div className="hero-card">
            <div>
              <span className="eyebrow"><Sparkles size={15} /> Focus. Connect. Deliver.</span>
              <h1>Work at a Chaise Hub</h1>
              <p>Book a verified workspace for your active project and get a secure pass for check-in.</p>
            </div>
            <div className="hero-icon" aria-hidden="true"><Building2 size={42} strokeWidth={1.7} /></div>
          </div>

          <div className="progress-card" aria-label="Booking progress">
            <Step number={1} label="Project details" active />
            <span className="step-line" />
            <Step number={2} label="Hub & schedule" />
            <span className="step-line" />
            <Step number={3} label="Get your pass" />
          </div>

          <form className="booking-grid" onSubmit={generatePass}>
            <div className="form-column">
              <section className="form-card">
                <div className="section-heading">
                  <span className="section-icon"><FileText size={19} /></span>
                  <div>
                    <span>Step 1</span>
                    <h2>Tell us about your project</h2>
                    <p>This helps the hub team prepare the right work environment.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field full-width">
                    <FieldLabel>Project name</FieldLabel>
                    <input value={projectName} onChange={(event) => setProjectName(event.target.value)} required />
                  </div>

                  <div className="field full-width">
                    <FieldLabel>Project details</FieldLabel>
                    <textarea value={projectDetails} onChange={(event) => setProjectDetails(event.target.value)} rows={4} required />
                    <small>{projectDetails.length}/500 characters</small>
                  </div>

                  <div className="field">
                    <FieldLabel>Start date</FieldLabel>
                    <div className="input-with-icon">
                      <CalendarDays size={17} />
                      <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                    </div>
                  </div>

                  <div className="field">
                    <FieldLabel>Expected finish date</FieldLabel>
                    <div className="input-with-icon">
                      <CalendarDays size={17} />
                      <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
                    </div>
                  </div>

                  <div className="field full-width">
                    <FieldLabel>Project value</FieldLabel>
                    <div className="currency-input">
                      <span>NGN</span>
                      <input
                        min={0}
                        type="number"
                        value={projectValue}
                        onChange={(event) => setProjectValue(Number(event.target.value))}
                        required
                      />
                    </div>
                    <small>Used only to estimate the 5% Chaise Hub service fee.</small>
                  </div>
                </div>

                <div className="milestone-header">
                  <div>
                    <h3>Project milestones</h3>
                    <p>Add the key outcomes and expected milestone payments.</p>
                  </div>
                  <button type="button" onClick={addMilestone}><Plus size={16} /> Add milestone</button>
                </div>

                <div className="milestone-list">
                  {milestones.map((milestone, index) => (
                    <div className="milestone-row" key={milestone.id}>
                      <span className="milestone-index">{index + 1}</span>
                      <input
                        aria-label={`Milestone ${index + 1} title`}
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(event) => updateMilestone(milestone.id, "title", event.target.value)}
                      />
                      <input
                        aria-label={`Milestone ${index + 1} due date`}
                        type="date"
                        value={milestone.dueDate}
                        onChange={(event) => updateMilestone(milestone.id, "dueDate", event.target.value)}
                      />
                      <div className="milestone-payment-input">
                        <span>NGN</span>
                        <input
                          aria-label={`Milestone ${index + 1} payment amount`}
                          min={0}
                          placeholder="Payment"
                          type="number"
                          value={milestone.paymentAmount}
                          onChange={(event) => updateMilestone(milestone.id, "paymentAmount", Number(event.target.value))}
                        />
                      </div>
                      <button type="button" aria-label={`Remove milestone ${index + 1}`} onClick={() => removeMilestone(milestone.id)}>
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="milestone-payment-note">
                  <div>
                    <span>First milestone payment</span>
                    <strong>{formatMoney(firstMilestonePayment)}</strong>
                  </div>
                  <div>
                    <span>5% hub fee deducted</span>
                    <strong>{formatMoney(serviceFee)}</strong>
                  </div>
                  <p>Balance after hub fee: <strong>{formatMoney(firstMilestoneBalance)}</strong></p>
                </div>

                <div className="step-actions">
                  <button className="secondary-button" type="button" onClick={proceedToHubSelection}>
                    Proceed to hub selection
                    <ChevronRight size={17} />
                  </button>
                </div>
              </section>

              <section className="form-card" id="hub-selection">
                <div className="section-heading">
                  <span className="section-icon"><MapPin size={19} /></span>
                  <div>
                    <span>Step 2</span>
                    <h2>Choose your hub and schedule</h2>
                    <p>Select where and when you would like to work.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field full-width">
                    <FieldLabel>Hub centre</FieldLabel>
                    <div className="select-wrap">
                      <Building2 size={17} />
                      <select value={hubName} onChange={(event) => setHubName(event.target.value)}>
                        {["Cafe One by Sterling", "Other Nigerian work hubs"].map((group) => (
                          <optgroup label={group} key={group}>
                            {hubs
                              .filter((hub) => hub.group === group)
                              .map((hub) => <option key={hub.label}>{hub.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown size={17} />
                    </div>
                  </div>

                  <div className="field full-width">
                    <FieldLabel>Work date</FieldLabel>
                    <div className="input-with-icon">
                      <CalendarDays size={17} />
                      <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} required />
                    </div>
                  </div>

                  <div className="field">
                    <FieldLabel>Start time</FieldLabel>
                    <div className="input-with-icon">
                      <Clock3 size={17} />
                      <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
                    </div>
                  </div>

                  <div className="field">
                    <FieldLabel>End time</FieldLabel>
                    <div className="input-with-icon">
                      <Clock3 size={17} />
                      <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="summary-column">
              <section className="summary-card">
                <div className="summary-title">
                  <div>
                    <span>Booking summary</span>
                    <h2>Your Chaise Hub pass</h2>
                  </div>
                  <span className="secure-icon"><ShieldCheck size={21} /></span>
                </div>

                <div className="summary-preview">
                  <span><MapPin size={17} /> Hub centre</span>
                  <strong>{formatHubName(hubName)}</strong>
                </div>

                <dl className="summary-list">
                  <div><dt>Work date</dt><dd>{formatDate(workDate)}</dd></div>
                  <div><dt>Time</dt><dd>{startTime} – {endTime}</dd></div>
                  <div><dt>Project timeline</dt><dd>{formatDate(startDate)} – {formatDate(endDate)}</dd></div>
                  <div><dt>Milestones</dt><dd>{milestones.length}</dd></div>
                  <div><dt>Milestone payments</dt><dd>{formatMoney(totalMilestonePayments)}</dd></div>
                </dl>

                <div className="fee-box">
                  <div>
                    <span>Chaise Hub service fee</span>
                    <strong>5%</strong>
                  </div>
                  <p>Estimated fee: <strong>{formatMoney(serviceFee)}</strong></p>
                  <small>Deducted from first milestone payment of {formatMoney(firstMilestonePayment)}.</small>
                </div>

                <label className="consent-row">
                  <input type="checkbox" checked={feeAccepted} onChange={(event) => setFeeAccepted(event.target.checked)} />
                  <span className="custom-checkbox"><Check size={14} /></span>
                  <span>I agree to the <strong>5% Chaise Hub service fee</strong> being deducted from the first milestone payment.</span>
                </label>

                {formError ? <p className="form-error" role="alert">{formError}</p> : null}

                <button className="primary-button" type="submit">
                  Generate hub pass
                  <span><QRCodeMini /></span>
                </button>

                <p className="privacy-note"><ShieldCheck size={14} /> Your project information is securely stored.</p>
              </section>

              <section className="tip-card">
                <Star size={18} fill="currentColor" />
                <div>
                  <strong>Before you arrive</strong>
                  <p>Bring a valid ID and show your QR pass at reception. Your desk will be held for 30 minutes.</p>
                </div>
              </section>
            </aside>
          </form>
        </section>
      </div>

      {pass ? (
        <div className="modal-backdrop" role="presentation">
          <section className="pass-modal" role="dialog" aria-modal="true" aria-labelledby="pass-title">
            <button className="modal-close" type="button" onClick={() => setPass(null)} aria-label="Close pass">
              <X size={20} />
            </button>

            <div className="success-mark"><CheckCircle2 size={31} /></div>
            <span className="pass-eyebrow">Booking confirmed</span>
            <h2 id="pass-title">Your hub pass is ready</h2>
            <p>Save this QR code on your phone and present it at the hub reception.</p>

            <div className="qr-card">
              <div className="qr-logo">chaise<span>.</span></div>
              <QRCodeCanvas
                id="hub-pass-qr"
                value={qrValue}
                size={196}
                bgColor="#ffffff"
                fgColor="#121A2B"
                level="M"
                marginSize={1}
              />
              <div className="pass-code-row">
                <span>{pass.code}</span>
                <button type="button" onClick={copyCode} aria-label="Copy pass code">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="pass-details">
              <div><span>Hub centre</span><strong>{formatHubName(pass.hubName)}</strong></div>
              <div><span>Date & time</span><strong>{formatDate(pass.workDate)} · {pass.time}</strong></div>
              <div><span>First milestone</span><strong>{formatMoney(pass.firstMilestonePayment)} · fee {formatMoney(pass.serviceFee)}</strong></div>
              <div><span>Project</span><strong>{pass.projectName}</strong></div>
            </div>

            <button className="download-button" type="button" onClick={downloadQr}>
              <Download size={18} /> Save QR to phone
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function QRCodeMini() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4 0h2v2h-2v-2Z" fill="currentColor" />
    </svg>
  );
}
