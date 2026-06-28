"use client";

import { useTransition } from "react";
import { Printer } from "lucide-react";

import { recordReceiptPrint } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function PrintButton({ saleId }: { saleId: string }) {
  const [isPending, startTransition] = useTransition();

  function handlePrint() {
    startTransition(async () => {
      await recordReceiptPrint({ saleId });
      window.print();
    });
  }

  return (
    <Button onClick={handlePrint} disabled={isPending}>
      <Printer size={17} />
      {isPending ? "Mencatat..." : "Print ulang struk"}
    </Button>
  );
}
