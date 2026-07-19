import type { Metadata } from "next";
import { ContractApp } from "@/components/ContractApp";

export const metadata: Metadata = {
  title: "Contract — Chaise Hub",
  description: "Create a direct client contract with escrow protection and optional Chaise Hub workspace access.",
};

export default function ContractPage() {
  return <ContractApp />;
}
