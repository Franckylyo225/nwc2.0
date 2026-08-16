import Link from "next/link";
import { PageHeader } from "@/components/admin/shell";
import { MessageView, loadMessage } from "../view";

export const dynamic = "force-dynamic";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await loadMessage(id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={message.name} description={message.email} />

      <Link
        href="/admin/messages"
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
      >
        ← Tous les messages
      </Link>

      <MessageView message={message} />
    </div>
  );
}
