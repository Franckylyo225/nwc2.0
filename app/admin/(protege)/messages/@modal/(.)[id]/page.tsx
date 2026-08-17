import { Drawer } from "@/components/admin/Drawer";
import { MessageView, loadMessage } from "../../view";

export const dynamic = "force-dynamic";

export default async function MessageDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await loadMessage(id);

  return (
    <Drawer
      title={message.name}
      description={message.email ?? message.phone ?? undefined}
    >
      <MessageView message={message} />
    </Drawer>
  );
}
