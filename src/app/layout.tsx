import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UnlockRequestProvider } from "@/context/UnlockRequestContext";
import { PendingSupervisorProvider } from "@/context/PendingSupervisorContext";
import { ReduxProvider } from "@/store/ReduxProvider";
import QueryProvider from "@/services/providers/QueryProvider";
import ToastContainer from "@/components/ui/toast/ToastContainer";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ReduxProvider>
          <QueryProvider>
            <ThemeProvider>
              <ToastProvider>
                <SubscriptionProvider>
                  <UnlockRequestProvider>
                    <PendingSupervisorProvider>
                      <SidebarProvider>{children}</SidebarProvider>
                    </PendingSupervisorProvider>
                  </UnlockRequestProvider>
                </SubscriptionProvider>
                <ToastContainer />
              </ToastProvider>
            </ThemeProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

