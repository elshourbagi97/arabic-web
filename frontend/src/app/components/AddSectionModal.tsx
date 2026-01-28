import React, { useState, useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<string> | string;
  existing: string[];
}

const AddSectionModal: React.FC<Props> = ({
  open,
  onClose,
  onCreate,
  existing,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    const val = (name || "").trim();
    if (!val) {
      setError("الاسم لا يمكن أن يكون فارغًا");
      return;
    }
    const exists = existing.some(
      (x) => x.localeCompare(val, undefined, { sensitivity: "accent" }) === 0,
    );
    if (exists) {
      setError("القسم موجود بالفعل");
      return;
    }
    try {
      setIsSaving(true);
      const created = await onCreate(val);
      // onCreate may resolve to string name or return created name
      if (created) {
        onClose();
      }
    } catch (e: any) {
      setError(e?.message || "فشل إنشاء القسم");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">إضافة قسم جديد</h3>
        <input
          dir="rtl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم القسم الجديد"
          className="w-full border rounded p-2 mb-3"
        />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <div className="flex gap-3 justify-start">
          <PrimaryButton onClick={submit} disabled={isSaving}>
            حفظ
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>إلغاء</SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;
