"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ConnectionProvider, useConnection } from "@/components/connection-provider";
import { ConnectionDialog } from "@/components/connection-dialog";
import { LoginScreen } from "@/components/login-screen";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { FileBrowser } from "@/components/file-browser";
import { Loader2 } from "lucide-react";

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

  // Auto-open connection dialog if not env-configured and not connected
  useEffect(() => {
    if (isEnvConfigured === false && !isConnected) {
      setConnectionOpen(true);
    }
  }, [isEnvConfigured, isConnected]);

  // Show loading while checking env config / auto-connecting
  if (isEnvConfigured === null || (!isConnected && isEnvConfigured === true)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-sm text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {!defaultBucket && (
          <Sidebar
            selectedBucket={selectedBucket}
            onSelectBucket={setSelectedBucket}
          />
        )}
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
