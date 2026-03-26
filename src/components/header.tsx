"use client";

import { useConnection } from "@/components/connection-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Unplug,
  Circle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { isConnected, disconnect, config } = useConnection();
  const { isAuthEnabled, logout } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("s3viewfy-theme") as
      | "dark"
      | "light"
      | null;
    const initial = saved || "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("s3viewfy-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
  };

  const handleDisconnect = async () => {
    disconnect();
    if (isAuthEnabled) {
      await logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              S3 Viewfy
            </h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              Universal Bucket Manager
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isConnected ? (
            <>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 px-3 py-1"
              >
                <Circle className="h-2 w-2 fill-emerald-400" />
                Connected
              </Badge>
              <span className="text-xs text-muted-foreground max-w-[200px] truncate hidden sm:inline-block">
                {config?.endpoint}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-destructive gap-1.5"
              >
                {isAuthEnabled ? (
                  <LogOut className="h-4 w-4" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isAuthEnabled ? "Logout" : "Disconnect"}
                </span>
              </Button>
            </>
          ) : (
            <Badge
              variant="outline"
              className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 gap-1.5 px-3 py-1"
            >
              <Circle className="h-2 w-2 fill-yellow-400" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
