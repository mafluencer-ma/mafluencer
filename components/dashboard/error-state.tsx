"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";

export default function ErrorState({
  message = "Une erreur est survenue.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass rounded-[20px] py-16 px-8 text-center flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-300">Oups !</p>
        <p className="text-slate-600 text-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Réessayer
        </Button>
      )}
    </div>
  );
}
