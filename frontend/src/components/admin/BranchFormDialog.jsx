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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import BranchIcon from "@/components/BranchIcon";
import { BRANCH_ICON_OPTIONS } from "@/constants/branchIcons";
import { ADMIN_FORM } from "@/constants/testIds/che";

const EMPTY = { name: "", description: "", icon: "Landmark" };

export default function BranchFormDialog({ open, onOpenChange, initial, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, description: initial.description, icon: initial.icon }
          : EMPTY
      );
      setError("");
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Branch name is required.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Edit branch" : "Add a new branch"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this branch's name, description or icon."
              : "Create a new branch. You can add its officer hierarchy right after."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="branch-name">Branch name</Label>
            <Input
              id="branch-name"
              data-testid={ADMIN_FORM.nameInput}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sports"
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="branch-description">Description</Label>
            <Textarea
              id="branch-description"
              data-testid={ADMIN_FORM.descriptionInput}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="One or two lines about this branch's purpose."
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="branch-icon">Icon</Label>
            <Select
              value={form.icon}
              onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}
            >
              <SelectTrigger id="branch-icon" data-testid={ADMIN_FORM.iconSelect} className="mt-1.5">
                <div className="flex items-center gap-2">
                  <BranchIcon name={form.icon} className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {BRANCH_ICON_OPTIONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      <BranchIcon name={icon} className="w-4 h-4" />
                      {icon}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" data-testid={ADMIN_FORM.saveButton} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}