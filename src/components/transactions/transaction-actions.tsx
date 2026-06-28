"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Save, XCircle } from "lucide-react";

import { changeSaleStatus, updateSaleNotes } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function TransactionActions({
  saleId,
  status,
  initialNotes,
}: {
  saleId: string;
  status: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const canChangeStatus = status === "COMPLETED";

  function saveNotes() {
    startTransition(async () => {
      const result = await updateSaleNotes({ saleId, notes });
      setMessage(result.message);
    });
  }

  function changeStatus(nextStatus: "VOIDED" | "REFUNDED") {
    startTransition(async () => {
      const result = await changeSaleStatus({
        saleId,
        status: nextStatus,
        notes,
      });
      setMessage(result.message);
    });
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Catatan & status</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Simpan catatan transaksi, void, atau refund bila diperlukan.
          </p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium">Catatan</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          placeholder="Contoh: alasan void/refund atau catatan kasir"
        />
      </label>

      {message && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            message.includes("berhasil") || message.includes("tercatat")
              ? "border-[#BFD6AC] bg-[#EEF7E8] text-[#3F6C2F]"
              : "border-[#E6C3BC] bg-[#FFF1EE] text-[#A63F31]"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={saveNotes}
          disabled={isPending}
        >
          <Save size={16} />
          Simpan catatan
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => changeStatus("VOIDED")}
          disabled={isPending || !canChangeStatus}
        >
          <XCircle size={16} />
          Void transaksi
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => changeStatus("REFUNDED")}
          disabled={isPending || !canChangeStatus}
        >
          <RotateCcw size={16} />
          Refund
        </Button>
      </div>

      {!canChangeStatus && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Transaksi yang sudah void/refund tidak bisa diubah status lagi.
        </p>
      )}
    </div>
  );
}
