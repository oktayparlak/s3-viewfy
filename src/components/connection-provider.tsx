"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle?: boolean;
  defaultBucket?: string;
}

interface ConnectionContextType {
  config: S3Config | null;
  isConnected: boolean;
  isConnecting: boolean;
  isEnvConfigured: boolean | null; // null = still checking, true/false = resolved
  defaultBucket: string | null;
  connect: (config: S3Config) => Promise<boolean>;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<S3Config | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnvConfigured, setIsEnvConfigured] = useState<boolean | null>(null);
  const [defaultBucket, setDefaultBucket] = useState<string | null>(null);

  const connect = useCallback(async (newConfig: S3Config): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/s3/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Connection failed");
      }

      setConfig(newConfig);
      setDefaultBucket(newConfig.defaultBucket || null);
      setIsConnected(true);
      return true;
    } catch {
      setIsConnected(false);
      setConfig(null);
      throw new Error("Failed to connect. Check your credentials and endpoint.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConfig(null);
    setIsConnected(false);
    setDefaultBucket(null);
  }, []);

  // Auto-connect from environment variables on mount
  useEffect(() => {
    async function checkEnvConfig() {
      try {
        const res = await fetch("/api/s3/config");
        const data = await res.json();

        if (data.configured) {
          setIsEnvConfigured(true);
          // Auto-connect with env config
          try {
            await connect(data.config);
          } catch {
            // If auto-connect fails, let user connect manually
            setIsEnvConfigured(false);
          }
        } else {
          setIsEnvConfigured(false);
        }
      } catch {
        setIsEnvConfigured(false);
      }
    }

    checkEnvConfig();
  }, [connect]);

  return (
    <ConnectionContext.Provider
      value={{
        config,
        isConnected,
        isConnecting,
        isEnvConfigured,
        defaultBucket,
        connect,
        disconnect,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
