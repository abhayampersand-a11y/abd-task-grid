import type { Metadata } from "next";
import { GroupDetailView } from "@/components/groups/group-detail-view";

export const metadata: Metadata = { title: "Group" };

export default async function GroupPage(
  props: PageProps<"/groups/[groupId]">,
) {
  const { groupId } = await props.params;
  return <GroupDetailView groupId={groupId} />;
}
