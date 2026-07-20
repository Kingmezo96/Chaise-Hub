"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquareText,
  Search,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";

type DashboardChromeProps = {
  activePage: "hub" | "contract";
  children: ReactNode;
  contentClassName?: string;
  contentId?: string;
};

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

export function DashboardChrome({ activePage, children, contentClassName = "content", contentId }: DashboardChromeProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentAnchor = contentId ? `#${contentId}` : activePage === "hub" ? "#hub-booking" : "#contract";

  const linkFor = (item: string) => {
    if (item === "Hub") return activePage === "hub" ? contentAnchor : "/";
    if (item === "Contract") return "/contract";
    return contentAnchor;
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((value) => !value)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link className="brand" href="/" aria-label="Chaise home">
          chaise<span>.</span>
        </Link>

        <nav className={`top-navigation ${mobileNavOpen ? "is-open" : ""}`} aria-label="Primary">
          {topNavigation.map((item) => (
            <Link
              className={
                (item === "Hub" && activePage === "hub") || (item === "Contract" && activePage === "contract")
                  ? "active"
                  : ""
              }
              href={linkFor(item)}
              key={item}
              onClick={() => setMobileNavOpen(false)}
              aria-current={
                (item === "Hub" && activePage === "hub") || (item === "Contract" && activePage === "contract")
                  ? "page"
                  : undefined
              }
            >
              {item}
            </Link>
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
          {categories.map((category) => <Link href={contentAnchor} key={category}>{category}</Link>)}
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
              <Link href={contentAnchor}>Open inbox</Link>
            </div>
          </section>
        </aside>

        <section className={contentClassName} id={contentId}>
          {children}
        </section>
      </div>
    </main>
  );
}
