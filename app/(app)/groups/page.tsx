import type { Metadata } from "next";
import { GroupsView } from "@/components/groups/groups-view";

export const metadata: Metadata = { title: "My Groups" };

export default function GroupsPage() {
  return <GroupsView />;
}
