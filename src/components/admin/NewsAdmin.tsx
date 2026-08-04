import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { newsQuery, type NewsPost } from "@/lib/queries";
import { formatDateNl, photoUrl } from "@/lib/photo";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const today = () => new Date().toISOString().slice(0, 10);

export function NewsAdmin() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery(newsQuery);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [form, setForm] = useState<{
    title: string;
    body: string;
    published_at: string;
    image_path: string | null;
  }>({ title: "", body: "", published_at: today(), image_path: null });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["news"] });

  const save = useMutation({
    mutationFn: async () => {
      const title = form.title.trim();
      if (title.length < 2) throw new Error("Vul een titel in");
      const payload = {
        title,
        body: form.body.trim(),
        published_at: form.published_at || today(),
        image_path: form.image_path,
      };
      if (editing) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", editing.id);
        if (error) throw new Error(error.message);
        return;
      }
      const { error } = await supabase.from("news_posts").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(editing ? "Bericht bijgewerkt" : "Bericht geplaatst");
      setOpen(false);
      setEditing(null);
      setForm({ title: "", body: "", published_at: today(), image_path: null });
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Bericht verwijderd");
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Nieuws</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);
                setForm({ title: "", body: "", published_at: today() });
              }}
            >
              <Plus className="mr-2 size-4" /> Nieuw bericht
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Bericht bewerken" : "Nieuw bericht"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="news-title">Titel</Label>
                <Input
                  id="news-title"
                  value={form.title}
                  maxLength={140}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-date">Datum</Label>
                <Input
                  id="news-date"
                  type="date"
                  value={form.published_at}
                  onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-body">Bericht</Label>
                <Textarea
                  id="news-body"
                  rows={6}
                  maxLength={4000}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen nieuwsberichten.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <li key={post.id} className="flex items-start gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateNl(post.published_at)}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                aria-label="Bewerken"
                onClick={() => {
                  setEditing(post);
                  setForm({
                    title: post.title,
                    body: post.body,
                    published_at: post.published_at.slice(0, 10),
                  });
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Verwijderen"
                className="text-primary"
                onClick={() => {
                  if (confirm("Bericht verwijderen?")) remove.mutate(post.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
