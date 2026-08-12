import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("mentions-legales");

export default function MentionsLegalesPage() {
  return <LegalPage slug="mentions-legales" />;
}
