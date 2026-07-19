import type { Metadata } from "next";
import { ClientContractPage } from "@/components/ClientContractPage";

type ContractPageProps = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: ContractPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Review contract ${reference} — Chaise`,
    description: "Review, request changes, accept and securely fund your Chaise direct contract.",
  };
}

export default async function ContractPage({ params }: ContractPageProps) {
  const { reference } = await params;
  return <ClientContractPage reference={reference} />;
}
