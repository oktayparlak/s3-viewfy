"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@/components/connection-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  HardDrive,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface S3BucketItem {
  name: string;
  creationDate?: string;
}

interface SidebarProps {
  selectedBucket: string | null;
  onSelectBucket: (bucket: string) => void;
}

export function Sidebar({ selectedBucket, onSelectBucket }: SidebarProps) {
  const { config, isConnected, useEnvConfig } = useConnection();
  const [buckets, setBuckets] = useState<S3BucketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = useCallback(async () => {
    if (!config || !isConnected) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/s3/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useEnvConfig ? { useEnvConfig: true } : { config }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      setBuckets(data.buckets);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buckets");
    } finally {
      setLoading(false);
    }
  }, [config, isConnected]);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  if (!isConnected) {
    return (
      <aside className="w-64 border-r border-white/10 bg-sidebar/50 backdrop-blur-xl flex flex-col">
        <div className="p-4 flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Connect to a storage provider to see your buckets
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-white/10 bg-sidebar/50 backdrop-blur-xl flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            Buckets
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={fetchBuckets}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Bucket List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-3 py-2.5">
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : error ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-destructive">{error}</p>
              <Button
                variant="link"
                size="sm"
                onClick={fetchBuckets}
                className="text-xs mt-1"
              >
                Try again
              </Button>
            </div>
          ) : buckets.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No buckets found</p>
            </div>
          ) : (
            buckets.map((bucket) => (
              <button
                key={bucket.name}
                onClick={() => onSelectBucket(bucket.name)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-2.5 group",
                  selectedBucket === bucket.name
                    ? "bg-cyan-500/15 text-cyan-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <HardDrive
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    selectedBucket === bucket.name
                      ? "text-cyan-400"
                      : "text-muted-foreground/60 group-hover:text-muted-foreground"
                  )}
                />
                <span className="truncate">{bucket.name}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Bucket Count */}
      {!loading && buckets.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <p className="text-[11px] text-muted-foreground text-center">
            {buckets.length} bucket{buckets.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </aside>
  );
}
