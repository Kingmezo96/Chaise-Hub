import type { Metadata } from "next";
import { ClientDashboard } from "@/components/ClientDashboard";

export const metadata: Metadata = {
  title: "Client Dashboard — Chaise",
  description: "Manage Chaise contracts, submissions, messages and escrow payments.",
};

export default function ClientDashboardPage() {
  return <ClientDashboard />;
}
