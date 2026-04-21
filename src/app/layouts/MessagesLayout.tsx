import { Outlet } from "react-router-dom";

export function MessagesLayout() {
  return (
    <div className="messages-layout">
      <Outlet />
    </div>
  );
}