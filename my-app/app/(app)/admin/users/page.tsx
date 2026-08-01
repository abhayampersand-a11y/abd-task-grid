import type { Metadata } from "next";
import { UserManagement } from "@/components/admin/user-management";

export const metadata: Metadata = { title: "User Management" };

export default function AdminUsersPage() {
  return <UserManagement />;
}
