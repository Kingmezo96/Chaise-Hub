"use client";

import { useMemo, useState } from "react";
import { ContractApp } from "@/components/ContractApp";
import { HubApp } from "@/components/HubApp";

type WorkspaceView = "contract" | "hub";

const workspaceViews = [
  {
    id: "contract",
    eyebrow: "Kontract",
    title: "Create secure direct contracts",
    copy: "Build a client agreement, preview the payment terms and send a review link with escrow protection.",
    source: "kontract-beige.vercel.app/#contract",
  },
  {
    id: "hub",
    eyebrow: "Chaise Hub",
    title: "Book a verified workspace",
    copy: "Choose a Cafe One or partner hub, confirm the project details and generate a QR check-in pass.",
    source: "chaise-hub.vercel.app",
  },
] as const;

export default function Home() {
  const [activeView, setActiveView] = useState<WorkspaceView>(() => {
    if (typeof window === "undefined") return "contract";
    return window.location.hash === "#hub" ? "hub" : "contract";
  });

  const activeWorkspace = useMemo(
    () => workspaceViews.find((view) => view.id === activeView) ?? workspaceViews[0],
    [activeView],
  );

  const switchWorkspace = (view: WorkspaceView) => {
    setActiveView(view);
    window.history.replaceState(null, "", `#${view}`);
    window.requestAnimationFrame(() => {
      document.getElementById("merged-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="merged-interface">
      <section className="merged-hero" id="merged-workspace">
        <div>
          <span className="merged-eyebrow">Chaise management hub</span>
          <h1>Kontract and Chaise Hub in one workspace</h1>
          <p>
            The direct-contract flow and hub-booking flow now sit inside one interface, so freelancers can move from
            agreement setup to workspace access without opening separate apps.
          </p>
        </div>
        <div className="merged-source-card">
          <span>Active source</span>
          <strong>{activeWorkspace.source}</strong>
        </div>
      </section>

      <nav className="merged-switcher" aria-label="Merged workspace switcher">
        {workspaceViews.map((view) => (
          <button
            className={activeView === view.id ? "active" : ""}
            type="button"
            key={view.id}
            onClick={() => switchWorkspace(view.id)}
          >
            <span>{view.eyebrow}</span>
            <strong>{view.title}</strong>
            <small>{view.copy}</small>
          </button>
        ))}
      </nav>

      <section className="merged-stage" aria-label={activeWorkspace.title}>
        {activeView === "contract" ? <ContractApp /> : <HubApp />}
      </section>
    </main>
  );
}
