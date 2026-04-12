import { mockUsers } from "@/lib/constants/mockData";
import type { MessageModel } from "@/types/models";

export function ChatThread({ messages }: { messages: MessageModel[] }) {
  return (
    <div className="space-y-3 bubble-card rounded-[38px] p-5">
      {messages.map((message) => {
        const sender = mockUsers.find((user) => user.id === message.senderId);
        return (
          <div key={message.id} className="rounded-[30px] bg-white/4 p-4">
            <p className="text-sm font-semibold text-text-primary">{sender?.displayName}</p>
            <p className="mt-2 text-sm text-text-secondary">{message.body}</p>
          </div>
        );
      })}
    </div>
  );
}
