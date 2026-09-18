import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { ADMIN_FORM } from "@/constants/testIds/che";

const EMPTY = { name: "", role: "" };

export default function PersonFormDialog({ open, onOpenChange, initial, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial);

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name, role: initial.role } : EMPTY);
      setError("");
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      setError("Both name and role/title are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Edit officer" : "Add an officer"}
          </DialogTitle>
          <DialogDescription>
            Photo, email and phone are generated automatically from the name and role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="person-name">Full name</Label>
            <Input
              id="person-name"
              data-testid={ADMIN_FORM.personNameInput}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Deepak Sir"
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="person-role">Role / title</Label>
            <Input
              id="person-role"
              data-testid={ADMIN_FORM.personRoleInput}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Assistant Director"
              className="mt-1.5"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid={ADMIN_FORM.personSaveButton} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add officer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}