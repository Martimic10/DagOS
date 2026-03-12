import { Activity } from "lucide-react";
import { ComingSoon } from "@/app/(app)/app/_placeholder";

export default function SystemPage() {
  return (
    <ComingSoon
      title="System"
      description="Real-time CPU, RAM, and GPU telemetry with per-model resource attribution."
      icon={Activity}
    />
  );
}
