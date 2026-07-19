"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createSampleProposal, type ContractProposal } from "@/lib/contracts";

type ClientFlow = "review" | "changes" | "changes-sent" | "auth" | "payment" | "funded";
type AuthMode = "login" | "create";

type NegotiationMessage = {
  id: string;
  sender: "freelancer" | "client";
  name: string;
  body: string;
  createdAt: string;
};

type ClientContractPageProps = {
  reference: string;
};

const formatMoney = (amount: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
}).format(amount || 0);

const formatDate = (value: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
};

const contractTypeLabel = {
  fixed: "Fixed price",
  hourly: "Hourly rate",
  milestones: "Milestone contract",
};

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

export function ClientContractPage({ reference }: ClientContractPageProps) {
  const fallbackProposal = useMemo(() => createSampleProposal(reference), [reference]);
  const [proposal, setProposal] = useState<ContractProposal>(fallbackProposal);
  const [flow, setFlow] = useState<ClientFlow>("review");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("create");
  const [clientName, setClientName] = useState("");
  const [accountEmail, setAccountEmail] = useState(fallbackProposal.clientEmail);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [scopeChange, setScopeChange] = useState(fallbackProposal.scope);
  const [deadlineChange, setDeadlineChange] = useState(fallbackProposal.deadline);
  const [revisionChange, setRevisionChange] = useState(fallbackProposal.revisions);
  const [amountChange, setAmountChange] = useState(String(fallbackProposal.contractValue));
  const [changeMessage, setChangeMessage] = useState("");
  const [changeSubmitting, setChangeSubmitting] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentDemo, setPaymentDemo] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [negotiationMessages, setNegotiationMessages] = useState<NegotiationMessage[]>([
    {
      id: "initial-proposal-message",
      sender: "freelancer",
      name: fallbackProposal.freelancerName,
      body: "Hi, I’ve shared the full proposal here. Feel free to leave comments or suggest any changes before accepting.",
      createdAt: fallbackProposal.sentAt,
    },
  ]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(`kontract:${reference}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ContractProposal;
          setProposal(parsed);
          setAccountEmail(parsed.clientEmail);
          setScopeChange(parsed.scope);
          setDeadlineChange(parsed.deadline);
          setRevisionChange(parsed.revisions);
          setAmountChange(String(parsed.contractValue));
          const storedMessages = window.localStorage.getItem(`kontract:messages:${reference}`);
          if (storedMessages) setNegotiationMessages(JSON.parse(storedMessages) as NegotiationMessage[]);
          else setNegotiationMessages([{ id: "initial-proposal-message", sender: "freelancer", name: parsed.freelancerName, body: "Hi, I’ve shared the full proposal here. Feel free to leave comments or suggest any changes before accepting.", createdAt: parsed.sentAt }]);
        } catch {
          window.localStorage.removeItem(`kontract:${reference}`);
        }
      }
      if (new URLSearchParams(window.location.search).get("funded") === "1") setFlow("funded");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [reference]);

  const stage = flow === "review" || flow === "changes" || flow === "changes-sent" ? 1 : flow === "auth" ? 2 : 3;
  const revisionLabel = proposal.revisions === "unlimited" ? "Unlimited" : `${proposal.revisions} revision${proposal.revisions === "1" ? "" : "s"}`;
  const freelancerInitials = proposal.freelancerName.split(" ").map((part) => part[0]).slice(0, 2).join("");

  const beginAcceptance = () => {
    if (!termsAccepted) {
      setTermsError("Please accept the contract terms before continuing.");
      return;
    }
    setTermsError("");
    setFlow("auth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scopeChange.trim() || !deadlineChange || !revisionChange || (Number(amountChange) || 0) <= 0) {
      setChangeError("Complete the proposed scope, deadline, revisions and amount.");
      return;
    }
    setChangeSubmitting(true);
    setChangeError("");
    try {
      const response = await fetch("/api/contract/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          reference,
          freelancerEmail: proposal.freelancerEmail,
          clientEmail: accountEmail || proposal.clientEmail,
          projectTitle: proposal.title,
          scope: scopeChange,
          deadline: deadlineChange,
          revisions: revisionChange,
          proposedAmount: Number(amountChange),
          message: changeMessage,
        }),
      });
      const result = await response.json() as { delivered?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to send the change request.");
      setEmailDelivered(Boolean(result.delivered));
      setFlow("changes-sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setChangeError(error instanceof Error ? error.message : "Unable to send the change request.");
    } finally {
      setChangeSubmitting(false);
    }
  };

  const submitAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authMode === "create" && !clientName.trim()) {
      setAuthError("Enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail) || password.length < 8) {
      setAuthError("Enter a valid email and a password of at least 8 characters.");
      return;
    }
    setAuthError("");
    setFlow("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const continueWithGoogle = () => {
    setClientName(clientName || "Google client");
    setAccountEmail(accountEmail || proposal.clientEmail);
    setAuthError("");
    setFlow("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendChatMessage = async () => {
    const body = chatInput.trim();
    if (!body || chatSending) return;
    const message: NegotiationMessage = {
      id: crypto.randomUUID(),
      sender: "client",
      name: clientName || accountEmail || "Client",
      body,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...negotiationMessages, message];
    setNegotiationMessages(nextMessages);
    setChatInput("");
    window.localStorage.setItem(`kontract:messages:${reference}`, JSON.stringify(nextMessages));
    const inboxKey = "kontract:freelancer-inbox";
    const currentInbox = JSON.parse(window.localStorage.getItem(inboxKey) || "[]") as NegotiationMessage[];
    window.localStorage.setItem(inboxKey, JSON.stringify([message, ...currentInbox].slice(0, 20)));
    window.dispatchEvent(new Event("kontract-inbox-updated"));
    setChatSending(true);
    try {
      await fetch("/api/contract/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, clientEmail: accountEmail || proposal.clientEmail, projectTitle: proposal.title, message: body }),
      });
    } finally {
      setChatSending(false);
    }
  };

  const saveClientWorkspace = () => {
    window.localStorage.setItem("kontract:client-active", JSON.stringify(proposal));
    window.localStorage.setItem("kontract:client-profile", JSON.stringify({
      name: clientName.trim() || "Chaise Africa",
      email: accountEmail || proposal.clientEmail,
    }));
  };

  const fundContract = async () => {
    setPaymentSubmitting(true);
    setPaymentError("");
    try {
      const response = await fetch("/api/contract/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          clientEmail: accountEmail,
          projectTitle: proposal.title,
          total: proposal.total,
        }),
      });
      const result = await response.json() as { url?: string; demo?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to start secure checkout.");
      if (result.url) {
        window.location.assign(result.url);
        return;
      }
      if (result.demo) {
        saveClientWorkspace();
        setPaymentDemo(true);
        setFlow("funded");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to start secure checkout.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <div className="kontract-scope">
      <main className="client-contract-shell">
      <header className="client-public-header">
        <Link className="brand" href="/" aria-label="Chaise home"><Image src="https://chaise.app/assets/images/chaise_yellow.png" alt="chaise" width={81} height={32} priority /></Link>
        <div className="client-header-security"><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon><span><strong>Secure contract</strong><small>Protected by Chaise escrow</small></span></div>
      </header>

      <section className="client-contract-container">
        <nav className="client-progress" aria-label="Contract completion progress">
          {[{ number: 1, title: "Review contract" }, { number: 2, title: "Your account" }, { number: 3, title: "Fund escrow" }].map((item) => (
            <div className={stage === item.number ? "active" : stage > item.number ? "complete" : ""} key={item.number}><span>{item.number}</span><strong>{item.title}</strong></div>
          ))}
        </nav>

        {(flow === "review" || flow === "changes") && (
          <>
            <div className="client-page-heading">
              <div><span className="eyebrow">Contract invitation</span><h1>{flow === "changes" ? "Propose contract changes" : "Review your contract"}</h1><p>{flow === "changes" ? "Update the terms you want the freelancer to reconsider." : `${proposal.freelancerName} invited you to review and fund this project.`}</p></div>
              <div className="client-contract-code"><span>Contract reference</span><strong>{reference}</strong></div>
            </div>

            {flow === "review" ? (
              <div className="client-review-grid">
                <article className="client-proposal card">
                  <div className="client-freelancer-strip"><span className="client-avatar">{freelancerInitials}</span><div><small>Proposal from</small><strong>{proposal.freelancerName}</strong><p>{proposal.freelancerRole}</p></div><span className="verified-chip"><Icon><path d="m7 12 3 3 7-7" /></Icon>Verified freelancer</span></div>
                  <div className="client-proposal-title"><span>{contractTypeLabel[proposal.contractType]}</span><h2>{proposal.title}</h2><p>Sent {formatDate(proposal.sentAt.slice(0, 10))}</p></div>
                  <section className="client-contract-section"><h3>Scope of work</h3><p>{proposal.scope}</p></section>
                  <section className="client-contract-facts"><div><span>Deadline</span><strong>{formatDate(proposal.deadline)}</strong></div><div><span>Revisions</span><strong>{revisionLabel}</strong></div><div><span>Workspace</span><strong>{proposal.hubEnabled ? proposal.hubLocation : "Remote"}</strong></div></section>
                  <section className="client-contract-section"><h3>Payment schedule</h3><div className="client-schedule">
                    {proposal.milestones.length ? proposal.milestones.map((milestone, index) => <div key={milestone.id}><span>{index + 1}</span><div><strong>{milestone.title}</strong><small>Due {formatDate(milestone.dueDate)}</small></div><b>{formatMoney(milestone.amount)}</b></div>) : <div><span>1</span><div><strong>Full project payment</strong><small>Funded before work begins</small></div><b>{formatMoney(proposal.contractValue)}</b></div>}
                  </div></section>
                  {proposal.files.length > 0 && <section className="client-contract-section"><h3>Reference files</h3><div className="client-file-list">{proposal.files.map((file) => <button type="button" key={`${file.name}-${file.size}`}><Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /></Icon><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span><Icon><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></Icon></button>)}</div></section>}
                  <div className="client-escrow-note"><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon><div><strong>Your payment is protected</strong><p>Funds stay in Chaise escrow and are released according to the agreed contract and approved work.</p></div></div>
                </article>

                <aside className="client-acceptance-card card">
                  <span className="step-label">Funding summary</span><h2>{formatMoney(proposal.total)}</h2><p>Total amount required to start the contract</p>
                  <dl><div><dt>Freelancer contract</dt><dd>{formatMoney(proposal.contractValue)}</dd></div><div><dt>Chaise service fee <span>5%</span></dt><dd>{formatMoney(proposal.platformFee)}</dd></div><div className={proposal.hubFee ? "" : "muted-row"}><dt>Hub workspace fee <span>5%</span></dt><dd>{proposal.hubFee ? formatMoney(proposal.hubFee) : "Not included"}</dd></div><div><dt>Total to fund</dt><dd>{formatMoney(proposal.total)}</dd></div></dl>
                  <label className="client-terms-check"><input type="checkbox" checked={termsAccepted} onChange={(event) => { setTermsAccepted(event.target.checked); setTermsError(""); }} /><span>I’ve reviewed the proposal and agree to the <a href="#contract-terms">contract terms</a> and escrow policy.</span></label>
                  <em className="consent-error">{termsError}</em>
                  <button className="primary-button full-width" type="button" onClick={beginAcceptance}>Accept &amp; continue<Icon><path d="m9 18 6-6-6-6" /></Icon></button>
                  <button className="secondary-button full-width" type="button" onClick={() => setFlow("changes")}><Icon><path d="m4 17 4-1 10-10-3-3L5 13l-1 4Z" /></Icon>Request changes</button>
                  <p className="client-no-charge"><Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /></Icon>You won’t be charged until the payment step.</p>
                </aside>
              </div>
            ) : (
              <div className="client-negotiation-grid">
              <form className="client-change-form card" onSubmit={submitChanges}>
                <div className="client-change-intro"><span className="client-avatar">{freelancerInitials}</span><div><strong>Changes will go to {proposal.freelancerName}</strong><p>The contract will pause until the freelancer reviews and sends updated terms.</p></div></div>
                <div className="field-grid two-columns"><label className="field"><span>Proposed project amount</span><div className="money-input"><b>USD</b><input type="number" min="1" step="0.01" value={amountChange} onChange={(event) => setAmountChange(event.target.value)} /></div></label><label className="field"><span>Proposed deadline</span><input type="date" value={deadlineChange} onChange={(event) => setDeadlineChange(event.target.value)} /></label></div>
                <label className="field"><span>Proposed scope of work</span><textarea rows={7} value={scopeChange} onChange={(event) => setScopeChange(event.target.value)} /></label>
                <div className="field-grid two-columns"><label className="field"><span>Number of revisions</span><select value={revisionChange} onChange={(event) => setRevisionChange(event.target.value)}><option value="0">No revisions</option><option value="1">1 revision</option><option value="2">2 revisions</option><option value="3">3 revisions</option><option value="4">4 revisions</option><option value="unlimited">Unlimited revisions</option></select></label><label className="field"><span>Message to freelancer <i>(optional)</i></span><textarea className="client-short-textarea" rows={3} value={changeMessage} onChange={(event) => setChangeMessage(event.target.value)} placeholder="Explain why you’re requesting these changes..." /></label></div>
                <em className="consent-error">{changeError}</em>
                <div className="form-actions between"><button className="text-button" type="button" onClick={() => setFlow("review")}><Icon><path d="m15 18-6-6 6-6" /></Icon>Back to contract</button><button className="primary-button" type="submit" disabled={changeSubmitting}>{changeSubmitting ? "Sending…" : "Send changes to freelancer"}<Icon><path d="m21 3-7.5 18-3.6-7-6.9-3.5L21 3Z" /></Icon></button></div>
              </form>
              <aside className="client-chat-card card" aria-label="Contract negotiation chat">
                <div className="client-chat-heading"><div><span className="step-label">Negotiation</span><h2>Contract comments</h2></div><span className="client-chat-live"><i />Live thread</span></div>
                <div className="client-chat-messages" aria-live="polite">
                  {negotiationMessages.map((message) => <div className={`client-chat-message ${message.sender}`} key={message.id}><div><strong>{message.sender === "client" ? "You" : message.name}</strong><small>{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(message.createdAt))}</small></div><p>{message.body}</p></div>)}
                </div>
                <div className="client-chat-composer"><label htmlFor="contract-comment">Add a comment</label><textarea id="contract-comment" rows={3} value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask a question or explain a suggested change..." /><button className="primary-button full-width" type="button" disabled={!chatInput.trim() || chatSending} onClick={sendChatMessage}>{chatSending ? "Sending…" : "Send comment"}<Icon><path d="m21 3-7.5 18-3.6-7-6.9-3.5L21 3Z" /></Icon></button><p>Comments also appear in the freelancer’s Chaise inbox. Email delivery depends on notification setup.</p></div>
              </aside>
              </div>
            )}
          </>
        )}

        {flow === "changes-sent" && <section className="client-state-card card"><div className="client-state-icon amber"><Icon><path d="m21 3-7.5 18-3.6-7-6.9-3.5L21 3Z" /><path d="m10 14 4-4" /></Icon></div><span className="eyebrow">Request submitted</span><h1>Changes sent to the freelancer</h1><p>{emailDelivered ? `We emailed your proposed changes to ${proposal.freelancerEmail}.` : "Your change request is recorded. Email delivery will activate when the notification service is connected."} You’ll receive a new link when the freelancer updates the contract.</p><div className="client-state-summary"><span>Contract</span><strong>{reference}</strong><span>Status</span><strong>Awaiting freelancer</strong></div><button className="secondary-button" type="button" onClick={() => setFlow("review")}>Return to contract</button></section>}

        {flow === "auth" && <section className="client-auth-layout"><div className="client-auth-card card"><span className="step-label">Secure your contract</span><h1>{authMode === "create" ? "Create your client account" : "Welcome back"}</h1><p>{authMode === "create" ? "Your account keeps contracts, payments and messages together." : "Sign in to continue funding this contract."}</p><div className="client-import-note"><Icon><path d="m7 12 3 3 7-7" /></Icon><div><strong>Your accepted agreement is ready</strong><p>The scope, timeline, milestones and amount will be added automatically—no setup process to repeat.</p></div></div><button className="client-google-button" type="button" onClick={continueWithGoogle}><span>G</span>Continue with Google</button><div className="client-auth-divider"><span>or continue with email</span></div><div className="client-auth-tabs"><button type="button" className={authMode === "create" ? "active" : ""} onClick={() => { setAuthMode("create"); setAuthError(""); }}>Create account</button><button type="button" className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Log in</button></div><form onSubmit={submitAccount}>{authMode === "create" && <label className="field"><span>Full name</span><input type="text" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Your full name" autoComplete="name" /></label>}<label className="field"><span>Email address</span><input type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} autoComplete="email" /></label><label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={authMode === "create" ? "new-password" : "current-password"} /></label><em className="consent-error">{authError}</em><button className="primary-button full-width" type="submit">{authMode === "create" ? "Create account & continue" : "Log in & continue"}<Icon><path d="m9 18 6-6-6-6" /></Icon></button></form><p className="client-auth-legal">By continuing, you agree to Chaise’s terms and privacy policy.</p></div><aside className="client-auth-summary card"><span className="contract-status">Accepted contract</span><h2>{proposal.title}</h2><div><span>Freelancer</span><strong>{proposal.freelancerName}</strong></div><div><span>Contract reference</span><strong>{reference}</strong></div><div><span>Amount to fund</span><strong>{formatMoney(proposal.total)}</strong></div><button className="text-button" type="button" onClick={() => setFlow("review")}><Icon><path d="m15 18-6-6 6-6" /></Icon>Back to review</button></aside></section>}

        {flow === "payment" && <section className="client-payment-layout"><article className="client-payment-card card"><div className="client-payment-heading"><span className="client-payment-icon"><Icon><path d="M4 7h16v11H4z" /><path d="M4 10h16M8 15h3" /></Icon></span><div><span className="step-label">Final step</span><h1>Fund your contract</h1><p>Your payment is placed in escrow before work begins.</p></div></div><div className="client-payment-method"><div><Icon><path d="M4 7h16v11H4z" /><path d="M4 10h16" /></Icon><span><strong>Secure card checkout</strong><small>Visa, Mastercard and supported local cards</small></span></div><span>Recommended</span></div><div className="client-payment-info"><Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></Icon><p>Stripe Checkout opens securely when payment credentials are connected. In preview mode, no card is charged.</p></div><em className="consent-error">{paymentError}</em><button className="primary-button full-width client-fund-button" type="button" disabled={paymentSubmitting} onClick={fundContract}>{paymentSubmitting ? "Opening secure checkout…" : `Fund ${formatMoney(proposal.total)}`}<Icon><path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon></button><button className="text-button" type="button" onClick={() => setFlow("auth")}><Icon><path d="m15 18-6-6 6-6" /></Icon>Back to account</button></article><aside className="client-payment-summary card"><span className="step-label">Payment summary</span><h2>{proposal.title}</h2><dl><div><dt>Contract value</dt><dd>{formatMoney(proposal.contractValue)}</dd></div><div><dt>Service fee</dt><dd>{formatMoney(proposal.platformFee)}</dd></div><div><dt>Hub fee</dt><dd>{proposal.hubFee ? formatMoney(proposal.hubFee) : "—"}</dd></div><div><dt>Total</dt><dd>{formatMoney(proposal.total)}</dd></div></dl><div className="client-payee"><span className="client-avatar small">{freelancerInitials}</span><div><small>Freelancer</small><strong>{proposal.freelancerName}</strong></div></div></aside></section>}

        {flow === "funded" && <section className="client-state-card card funded"><div className="client-state-icon"><Icon><path d="m5 12 4 4L19 6" /></Icon></div><span className="eyebrow">Contract funded</span><h1>The work can now begin</h1><p>{paymentDemo ? "This preview completed without charging a card. Connect Stripe to accept live escrow payments." : `Your ${formatMoney(proposal.total)} payment is secured in Chaise escrow.`} {proposal.freelancerName} can start the project and you’ll be notified about each milestone.</p><div className="client-funded-grid"><div><span>Contract</span><strong>{reference}</strong></div><div><span>Project deadline</span><strong>{formatDate(proposal.deadline)}</strong></div><div><span>Status</span><strong>Active</strong></div></div><div className="client-next-actions"><Link className="primary-button" href="/client/dashboard" onClick={saveClientWorkspace}>Return to Contracts</Link><button className="secondary-button" type="button" onClick={() => window.print()}>Download receipt</button></div></section>}
      </section>
      <footer className="client-public-footer"><span>© 2026 Chaise Technologies</span><div><a href="#contract-terms">Terms</a><a href="#privacy">Privacy</a><a href="#support">Get help</a></div></footer>
      </main>
    </div>
  );
}
