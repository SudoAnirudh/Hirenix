"use client";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      message="Syncing Dashboard"
      submessage="Updating Your Career Metrics"
    />
  );
}
