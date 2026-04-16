import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { MessagesProvider } from "@/app/providers/MessagesProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MessagesProvider>{children}</MessagesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
