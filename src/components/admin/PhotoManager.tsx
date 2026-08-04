import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImageIcon, Trash2, Upload } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { photoUrl } from "@/lib/photo";
import { collectionPhotosQuery, subcollectionPhotosQuery, type Photo } from "@/lib/queries";

type Target = { collectionId: string; subcollectionId?: string };

export function PhotoManager({ target }: { target: Target }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const query = target.subcollectionId
    ? subcollectionPhotosQuery(target.subcollectionId)
    : collectionPhotosQuery(target.collectionId);
  const { data: photos = [], isLoading } = useQuery(query);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["photos"] });
    void queryClient.invalidateQueries({ queryKey: ["collection-counts"] });
  };

  const upload = async (files: FileList) => {
    setUploading(true);
    let nextOrder = photos.length;
    try {
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${target.subcollectionId ?? target.collectionId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);

        const { error } = await supabase.from("photos").insert({
          collection_id: target.collectionId,
          subcollection_id: target.subcollectionId ?? null,
          title: file.name.replace(/\.[^.]+$/, ""),
          storage_path: path,
          image_url: `/api/public/img/${path}`,
          sort_order: nextOrder,
        });
        if (error) throw new Error(error.message);
        nextOrder += 1;
      }
      toast.success("Foto's geüpload");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uploaden mislukt");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = useMutation({
    mutationFn: async (photo: Photo) => {
      await supabase.storage.from("photos").remove([photo.storage_path]);
      const { error } = await supabase.from("photos").delete().eq("id", photo.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Foto verwijderd");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const move = useMutation({
    mutationFn: async ({ index, direction }: { index: number; direction: -1 | 1 }) => {
      const a = photos[index];
      const b = photos[index + direction];
      if (!a || !b) return;
      const updates = [
        supabase.from("photos").update({ sort_order: b.sort_order }).eq("id", a.id),
        supabase.from("photos").update({ sort_order: a.sort_order }).eq("id", b.id),
      ];
      // Guard against identical sort_order values from older uploads.
      if (a.sort_order === b.sort_order) {
        updates[0] = supabase
          .from("photos")
          .update({ sort_order: a.sort_order + direction })
          .eq("id", a.id);
      }
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  const setCover = useMutation({
    mutationFn: async (photo: Photo) => {
      const table = target.subcollectionId ? "subcollections" : "collections";
      const id = target.subcollectionId ?? target.collectionId;
      const { error } = await supabase
        .from(table)
        .update({ cover_photo_url: photo.storage_path })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Omslagfoto ingesteld");
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const renamePhoto = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from("photos").update({ title }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && e.target.files.length > 0 && void upload(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 size-4" />
          {uploading ? "Uploaden…" : "Foto's uploaden"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {photos.length} {photos.length === 1 ? "foto" : "foto's"}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen foto&apos;s hier.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[4/3] bg-muted">
                <img
                  src={photoUrl(photo.storage_path) ?? ""}
                  alt={photo.title}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="space-y-3 p-3">
                <Input
                  defaultValue={photo.title}
                  maxLength={120}
                  onBlur={(e) => {
                    const title = e.target.value.trim();
                    if (title !== photo.title) renamePhoto.mutate({ id: photo.id, title });
                  }}
                />
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Naar links"
                    disabled={index === 0}
                    onClick={() => move.mutate({ index, direction: -1 })}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Naar rechts"
                    disabled={index === photos.length - 1}
                    onClick={() => move.mutate({ index, direction: 1 })}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCover.mutate(photo)}
                    title="Gebruik als omslagfoto"
                  >
                    <ImageIcon className="mr-1 size-4" /> Omslag
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Verwijderen"
                    className="ml-auto text-primary"
                    onClick={() => removePhoto.mutate(photo)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
