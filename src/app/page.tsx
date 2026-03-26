"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ConnectionProvider, useConnection } from "@/components/connection-provider";
import { ConnectionDialog } from "@/components/connection-dialog";
import { LoginScreen } from "@/components/login-screen";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { FileBrowser } from "@/components/file-browser";
import { Database, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppContent() {
  const { isConnected, defaultBucket, isEnvConfigured } = useConnection();
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  // Auto-select bucket if defaultBucket is provided
  useEffect(() => {
    if (isConnected && defaultBucket) {
      setSelectedBucket(defaultBucket);
    }
  }, [isConnected, defaultBucket]);

  // Show loading while checking env config
  if (isEnvConfigured === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-sm text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen when not connected
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10 text-center space-y-8 px-6 max-w-lg">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 opacity-20 blur-xl animate-pulse" />
            <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <Database className="h-11 w-11 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              S3 Viewfy
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Connect to any S3-compatible storage and effortlessly manage your
              buckets and files.
            </p>
          </div>

          {/* Providers */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["AWS S3", "MinIO", "Cloudflare R2", "DigitalOcean Spaces"].map(
              (provider) => (
                <span
                  key={provider}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-muted-foreground"
                >
                  {provider}
                </span>
              )
            )}
          </div>

          {/* Connect Button */}
          <Button
            size="lg"
            onClick={() => setConnectionOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-2xl shadow-cyan-500/30 px-8 gap-2 text-base h-12"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <ConnectionDialog
          open={connectionOpen}
          onOpenChange={setConnectionOpen}
        />
      </div>
    );
  }

  return (
    <>
      <Header onOpenConnection={() => setConnectionOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          selectedBucket={selectedBucket}
          onSelectBucket={setSelectedBucket}
        />
        <FileBrowser bucket={selectedBucket} />
      </div>
      <ConnectionDialog
        open={connectionOpen}
        onOpenChange={setConnectionOpen}
      />
    </>
  );
}

function AuthGate() {
  const { isAuthenticated, isAuthEnabled } = useAuth();

  // Still checking auth status
  if (isAuthEnabled === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth is enabled but user is not authenticated
  if (isAuthEnabled && !isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated or no auth required
  return (
    <ConnectionProvider>
      <AppContent />
    </ConnectionProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <AuthGate />
      </div>
    </AuthProvider>
  );
}
