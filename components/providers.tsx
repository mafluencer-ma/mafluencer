"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background:   isDark ? "#1E293B" : "#FFFFFF",
          color:        isDark ? "#E2E8F0" : "#0F172A",
          border:       isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: "12px",
          fontSize:     "14px",
          boxShadow:    isDark
            ? "0 4px 24px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(0,0,0,0.1)",
        },
        success: {
          iconTheme: {
            primary:   "#10B981",
            secondary: isDark ? "#1E293B" : "#FFFFFF",
          },
        },
        error: {
          iconTheme: {
            primary:   "#EF4444",
            secondary: isDark ? "#1E293B" : "#FFFFFF",
          },
        },
      }}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry:     1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}
