import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { MessagesProvider } from "@/app/providers/MessagesProvider";
import { NotificationToastProvider } from "@/app/providers/NotificationToastProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationToastProvider>
          <MessagesProvider>{children}</MessagesProvider>
        </NotificationToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
