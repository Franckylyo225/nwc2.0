import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("cgv");

export default function CgvPage() {
  return <LegalPage slug="cgv" />;
}
