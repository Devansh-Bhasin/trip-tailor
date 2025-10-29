import { useState, useRef, useEffect } from "react";
import { Compass, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import AdventureCard from "@/components/AdventureCard";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Adventure {
  title: string;
  duration: string;
  budget: string;
  description: string;
  activities: Array<{
    time: string;
    place: string;
    type: string;
    description: string;
    tip?: string;
  }>;
  transport: string;
  totalCost: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, adventures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setAdventures([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-adventure", {
        body: { message: userMessage },
      });

      if (error) {
        throw error;
      }

      if (data?.adventures && Array.isArray(data.adventures)) {
        setAdventures(data.adventures);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I've created ${data.adventures.length} personalized adventure${
              data.adventures.length > 1 ? "s" : ""
            } for you! Check them out below:`,
          },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error generating adventure:", error);
      
      let errorMessage = "Sorry, I couldn't generate adventures. Please try again.";
      
      if (error.message?.includes("Rate limit")) {
        errorMessage = "Too many requests! Please wait a moment and try again.";
      } else if (error.message?.includes("credits")) {
        errorMessage = "AI credits depleted. Please add credits to continue.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "Saturday afternoon, 2 friends, love sushi, low budget, using transit near Langley",
    "Evening date night in Vancouver, upscale dining, driving",
    "Family day in Richmond, 4 people, outdoor activities, under $100 total",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-gradient-hero text-white py-8 px-4 shadow-strong">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Metro Vancouver Adventures</h1>
          </div>
          <p className="text-white/90 text-lg">
            Your AI-powered local adventure planner for Surrey, Richmond, Langley & beyond
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Initial State */}
        {messages.length === 0 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What kind of adventure are you looking for?
              </h2>
              <p className="text-muted-foreground">
                Tell me about your plans and I'll create personalized itineraries
              </p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground font-medium">Try these examples:</p>
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="block w-full text-left p-4 rounded-lg bg-card hover:bg-muted/50 border border-border transition-colors shadow-soft hover:shadow-medium"
                >
                  <p className="text-sm text-card-foreground">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-6">
            {messages.map((message, idx) => (
              <ChatMessage key={idx} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center shadow-soft">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card rounded-2xl px-4 py-3 shadow-soft border border-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adventure Cards */}
        {adventures.length > 0 && (
          <div className="space-y-6 mb-6">
            {adventures.map((adventure, idx) => (
              <AdventureCard key={idx} {...adventure} />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Footer */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 px-4 shadow-strong">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your ideal adventure..."
            disabled={isLoading}
            className="flex-1 shadow-soft"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default Index;
