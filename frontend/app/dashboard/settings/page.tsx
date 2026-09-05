"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  ShieldCheck,
  Github,
  Linkedin,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "integrations">(
    "account",
  );
  const [saved, setSaved] = useState(false);

  const [targetRole, setTargetRole] = useState("AI / Backend Engineer");
  const [targetLocation, setTargetLocation] = useState(
    "San Francisco, CA / Remote",
  );
  const [targetSalary, setTargetSalary] = useState("$180,000+");

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hirenix_target_role", targetRole);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wider">
            <Settings size={14} /> System Configuration
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
            Workstation Settings & Integrations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage target roles, connected accounts, and AI preference
            parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-muted/50 text-xs shrink-0">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "account"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Target Preferences
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === "integrations"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Connected Accounts
          </button>
        </div>
      </div>

      {activeTab === "account" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Target Career Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Hirenix matching algorithms use these settings to rank job
              openings and compute skill gap vectors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Target Role Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 bg-muted/50 border border-border rounded-lg font-mono text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Target Work Locations
              </label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full p-2.5 bg-muted/50 border border-border rounded-lg font-mono text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Minimum Target Salary
              </label>
              <input
                type="text"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
                className="w-full p-2.5 bg-muted/50 border border-border rounded-lg font-mono text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button onClick={handleSave} variant="primary" size="sm">
                <Save size={14} className="mr-1.5" /> Save Preferences
              </Button>

              {saved && (
                <span className="font-mono text-xs text-emerald-600 font-bold">
                  ✓ Settings Saved Successfully
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "integrations" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
                    <Github size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      GitHub Account Integration
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Synchronized handle: @sudo-anirudh
                    </CardDescription>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  CONNECTED & SYNCED
                </span>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
                    <Linkedin size={20} className="text-[#0A66C2]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      LinkedIn Profile Audit
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Text import active
                    </CardDescription>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  CONNECTED
                </span>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
