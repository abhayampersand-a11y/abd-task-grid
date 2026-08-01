import type { Metadata } from "next";
import { TaskDetailView } from "@/components/tasks/task-detail-view";

export const metadata: Metadata = { title: "Task" };

export default async function TaskPage(props: PageProps<"/tasks/[taskId]">) {
  const { taskId } = await props.params;
  return <TaskDetailView taskId={taskId} />;
}
