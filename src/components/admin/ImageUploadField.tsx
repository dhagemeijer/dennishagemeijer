import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { photoUrl, uploadImage } from "@/lib/photo";

type Props = {
  label: string;
  value: string | null;
  folder: string;
  onChange: (path: string | null) => void;
};

export function ImageUploadField({ label, value, folder, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const preview = photoUrl(value);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadImage(supabase, file, folder);
      onChange(path);
      toast.success("Afbeelding geüpload");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uploaden mislukt");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden bg-muted">
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            {uploading ? "Uploaden…" : preview ? "Vervangen" : "Kiezen"}
          </Button>
          {preview ? (
            <Button type="button" variant="outline" onClick={() => onChange(null)}>
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
