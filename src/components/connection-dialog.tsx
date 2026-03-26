"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnection, type S3Config } from "@/components/connection-provider";
import {
  Cloud,
  Loader2,
  Zap,
} from "lucide-react";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionDialog({ open, onOpenChange }: ConnectionDialogProps) {
  const { connect, isConnecting } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<S3Config>({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-1",
    forcePathStyle: true,
    defaultBucket: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await connect(formData);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] border-white/10 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Connect to Storage
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your S3-compatible storage credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Endpoint */}
          <div className="space-y-1.5">
            <Label htmlFor="endpoint" className="text-sm">
              Endpoint URL
            </Label>
            <Input
              id="endpoint"
              placeholder="https://s3.amazonaws.com"
              value={formData.endpoint}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endpoint: e.target.value }))
              }
              className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 transition-colors"
              required
            />
          </div>

          {/* Access Key & Secret Key */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accessKeyId" className="text-sm">
                Access Key ID
              </Label>
              <Input
                id="accessKeyId"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={formData.accessKeyId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accessKeyId: e.target.value,
                  }))
                }
                className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 transition-colors font-mono text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secretAccessKey" className="text-sm">
                Secret Access Key
              </Label>
              <Input
                id="secretAccessKey"
                type="password"
                placeholder="••••••••••••••••"
                value={formData.secretAccessKey}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    secretAccessKey: e.target.value,
                  }))
                }
                className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 transition-colors font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <Label htmlFor="region" className="text-sm">
              Region
            </Label>
            <Input
              id="region"
              placeholder="us-east-1"
              value={formData.region}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, region: e.target.value }))
              }
              className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Bucket Name (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="defaultBucket" className="text-sm">
              Bucket Name{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="defaultBucket"
              placeholder="my-bucket"
              value={formData.defaultBucket}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultBucket: e.target.value,
                }))
              }
              className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 transition-colors"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave empty to see all buckets, or enter a name to go directly to a specific bucket.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
