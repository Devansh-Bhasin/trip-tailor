import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div 
      className={`flex gap-3 animate-slide-up ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center shadow-soft">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser 
            ? "bg-primary text-primary-foreground shadow-medium" 
            : "bg-card text-card-foreground shadow-soft border border-border"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
