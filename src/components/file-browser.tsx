"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useConnection } from "@/components/connection-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  FileText,
  Download,
  Trash2,
  Upload,
  MoreVertical,
  RefreshCw,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  ChevronRight,
  ChevronLeft,
  FolderOpen,
  Home,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface S3ObjectItem {
  key: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  etag?: string;
}

interface FileBrowserProps {
  bucket: string | null;
}

function getFileName(key: string): string {
  const parts = key.replace(/\/$/, "").split("/");
  return parts[parts.length - 1] || key;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(key: string) {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "ico", "bmp"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "mkv", "webm"];
  const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
  const archiveExts = ["zip", "tar", "gz", "rar", "7z", "bz2"];
  const codeExts = ["js", "ts", "tsx", "jsx", "py", "go", "rs", "java", "cpp", "c", "h", "css", "html", "json", "xml", "yaml", "yml", "toml", "md"];

  if (imageExts.includes(ext)) return <FileImage className="h-4 w-4 text-purple-400" />;
  if (videoExts.includes(ext)) return <FileVideo className="h-4 w-4 text-pink-400" />;
  if (audioExts.includes(ext)) return <FileAudio className="h-4 w-4 text-orange-400" />;
  if (archiveExts.includes(ext)) return <FileArchive className="h-4 w-4 text-yellow-400" />;
  if (codeExts.includes(ext)) return <FileCode className="h-4 w-4 text-emerald-400" />;
  if (ext === "pdf") return <FileText className="h-4 w-4 text-red-400" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export function FileBrowser({ bucket }: FileBrowserProps) {
  const { config, useEnvConfig } = useConnection();
  const [objects, setObjects] = useState<S3ObjectItem[]>([]);
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ITEMS_PER_PAGE = 50;

  const fetchObjects = useCallback(async () => {
    if (!config || !bucket) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/s3/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useEnvConfig
            ? { useEnvConfig: true, bucket, prefix }
            : { config, bucket, prefix }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      setObjects(data.objects);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load objects");
    } finally {
      setLoading(false);
    }
  }, [config, bucket, prefix]);

  useEffect(() => {
    if (bucket) {
      setPrefix("");
      setObjects([]);
      setCurrentPage(1);
    }
  }, [bucket]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const handleDownload = async (key: string) => {
    if (!config || !bucket) return;
    try {
      const res = await fetch("/api/s3/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useEnvConfig
            ? { useEnvConfig: true, bucket, key }
            : { config, bucket, key }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      window.open(data.url, "_blank");
      toast.success(`Download started: ${getFileName(key)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleDelete = async () => {
    if (!config || !bucket || !deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch("/api/s3/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useEnvConfig
            ? { useEnvConfig: true, bucket, key: deleteTarget }
            : { config, bucket, key: deleteTarget }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success(`Deleted: ${getFileName(deleteTarget)}`);
      setDeleteTarget(null);
      fetchObjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !config || !bucket) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        if (useEnvConfig) {
          formData.append("useEnvConfig", "true");
        } else {
          formData.append("config", JSON.stringify(config));
        }
        formData.append("bucket", bucket);
        formData.append("prefix", prefix);

        const res = await fetch("/api/s3/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        toast.success(`Uploaded: ${file.name}`);
      }
      fetchObjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const navigateToFolder = (folderKey: string) => {
    setPrefix(folderKey);
    setCurrentPage(1);
  };

  const breadcrumbParts = prefix.split("/").filter(Boolean);

  // Empty state when no bucket selected
  if (!bucket) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-cyan-400/60" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Select a Bucket
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a bucket from the sidebar to browse its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col min-w-0"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-white/10 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => setPrefix("")}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  {bucket}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbParts.map((part, index) => {
                const pathPrefix =
                  breadcrumbParts.slice(0, index + 1).join("/") + "/";
                return (
                  <React.Fragment key={pathPrefix}>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={() => setPrefix(pathPrefix)}
                        className="cursor-pointer hover:text-cyan-400 transition-colors"
                      >
                        {part}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={fetchObjects}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-50 bg-cyan-500/10 backdrop-blur-sm border-2 border-dashed border-cyan-500/50 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <Upload className="h-12 w-12 mx-auto text-cyan-400" />
            <p className="text-lg font-medium text-cyan-400">
              Drop files to upload
            </p>
          </div>
        </div>
      )}

      {/* File Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1 max-w-[300px]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchObjects}>
                Try again
              </Button>
            </div>
          </div>
        ) : objects.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  This folder is empty
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload files or drag and drop them here
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[45%] text-xs font-medium text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="w-[15%] text-xs font-medium text-muted-foreground">
                  Size
                </TableHead>
                <TableHead className="w-[25%] text-xs font-medium text-muted-foreground">
                  Last Modified
                </TableHead>
                <TableHead className="w-[15%] text-xs font-medium text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objects
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE
                )
                .map((obj) => (
                <TableRow
                  key={obj.key}
                  className="border-white/5 hover:bg-white/[0.03] group cursor-pointer transition-colors"
                  onClick={() => {
                    if (obj.isFolder) navigateToFolder(obj.key);
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {obj.isFolder ? (
                        <Folder className="h-4 w-4 text-cyan-400 shrink-0" />
                      ) : (
                        getFileIcon(obj.key)
                      )}
                      <span className="truncate">
                        {getFileName(obj.key)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {obj.isFolder ? "—" : formatBytes(obj.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(obj.lastModified)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!obj.isFolder && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(obj.key);
                            }}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(obj.key);
                            }}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer: Object count + Pagination */}
      {!loading && objects.length > 0 && (
        <div className="px-6 py-2 border-t border-border/40 bg-background/50 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {objects.filter((o) => o.isFolder).length} folders,{" "}
            {objects.filter((o) => !o.isFolder).length} files
          </p>
          {objects.length > ITEMS_PER_PAGE && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                Page {currentPage} of{" "}
                {Math.ceil(objects.length / ITEMS_PER_PAGE)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={
                  currentPage >=
                  Math.ceil(objects.length / ITEMS_PER_PAGE)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-white/10 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Object</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget ? getFileName(deleteTarget) : ""}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
