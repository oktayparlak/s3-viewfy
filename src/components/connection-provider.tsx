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
  isEnvConfigured: boolean | null;
  useEnvConfig: boolean;
  defaultBucket: string | null;
  connect: (config: S3Config) => Promise<boolean>;
  connectWithEnv: () => Promise<boolean>;
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
  const [envConfigured, setEnvConfigured] = useState(false);
  const [defaultBucket, setDefaultBucket] = useState<string | null>(null);

  // Safe JSON parser — returns null if response is not valid JSON
  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // Manual connect with client-provided credentials
  const connect = useCallback(async (newConfig: S3Config): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/s3/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Connection failed (${res.status})`);
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

  // Connect using server-side env vars (no credentials sent to client)
  const connectWithEnv = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/s3/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useEnvConfig: true }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Connection failed (${res.status})`);
      }

      // Set a placeholder config (actual credentials stay server-side)
      setConfig({
        endpoint: "env-configured",
        accessKeyId: "",
        secretAccessKey: "",
        region: "",
      });
      setEnvConfigured(true);
      setIsConnected(true);
      return true;
    } catch {
      setIsConnected(false);
      throw new Error("Failed to connect with environment configuration.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConfig(null);
    setIsConnected(false);
    setDefaultBucket(null);
    setEnvConfigured(false);
    setIsEnvConfigured(false);
  }, []);

  // Auto-connect from env on mount
  useEffect(() => {
    async function checkEnvConfig() {
      try {
        const res = await fetch("/api/s3/config");
        if (!res.ok) {
          setIsEnvConfigured(false);
          return;
        }
        const data = await safeJson(res);
        if (!data) {
          setIsEnvConfigured(false);
          return;
        }

        if (data.configured) {
          setIsEnvConfigured(true);
          setDefaultBucket(data.defaultBucket || null);
          try {
            await connectWithEnv();
          } catch {
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
  }, [connectWithEnv]);

  return (
    <ConnectionContext.Provider
      value={{
        config,
        isConnected,
        isConnecting,
        isEnvConfigured,
        useEnvConfig: envConfigured,
        defaultBucket,
        connect,
        connectWithEnv,
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
