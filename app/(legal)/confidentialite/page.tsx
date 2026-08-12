import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("confidentialite");

export default function ConfidentialitePage() {
  return <LegalPage slug="confidentialite" />;
}
