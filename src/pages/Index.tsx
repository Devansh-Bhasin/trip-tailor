import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/ChatMessage";
import AdventureCard from "@/components/AdventureCard";
import OnboardingForm, { UserPreferences } from "@/components/OnboardingForm";
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
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("tripTailorPreferences");
    if (saved) {
      setUserPreferences(JSON.parse(saved));
      setShowOnboarding(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, adventures]);

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    localStorage.setItem("tripTailorPreferences", JSON.stringify(preferences));
    setShowOnboarding(false);
    
    toast({
      title: "Profile saved! 🎉",
      description: "Now I can tailor adventures just for you.",
    });
  };

  const buildContextualPrompt = (userMessage: string) => {
    if (!userPreferences) return userMessage;

    const context = `User preferences: 
- Interests: ${userPreferences.interests.join(", ")}
- Budget: ${userPreferences.budgetRange}
- Transportation: ${userPreferences.transportation}
- Group size: ${userPreferences.groupSize}
- Preferred areas: ${userPreferences.favoriteAreas.join(", ")}

User request: ${userMessage}`;

    return context;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setAdventures([]);

    try {
      const contextualPrompt = buildContextualPrompt(userMessage);

      const { data, error } = await supabase.functions.invoke("generate-adventure", {
        body: { message: contextualPrompt },
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
            content: `I've tailored ${data.adventures.length} perfect adventure${
              data.adventures.length > 1 ? "s" : ""
            } based on your preferences! 🎯`,
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

  const quickPrompts = [
    "Plan a romantic evening",
    "Fun day with friends",
    "Family adventure",
    "Solo exploration",
  ];

  if (showOnboarding) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-gradient-card backdrop-blur-lg border-b border-border shadow-medium">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TripTailor
              </h1>
              <p className="text-xs text-muted-foreground">Tailored for you</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowOnboarding(true)}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="text-center space-y-8 animate-fade-in py-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {userPreferences?.interests.length || 0} interests • {userPreferences?.budgetRange} budget
                </span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-3">
                What's your next adventure?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                I've learned your preferences. Just tell me what you're in the mood for!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="p-4 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-medium group"
                >
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {prompt}
                  </p>
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card rounded-2xl px-4 py-3 shadow-soft border border-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adventure Cards */}
        {adventures.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {adventures.map((adventure, idx) => (
              <AdventureCard key={idx} {...adventure} />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Enhanced Input Footer */}
      <footer className="sticky bottom-0 bg-gradient-card backdrop-blur-lg border-t border-border shadow-strong">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your perfect adventure..."
              disabled={isLoading}
              className="flex-1 rounded-xl shadow-soft border-2 focus:border-primary"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="gap-2 rounded-xl shadow-medium hover:shadow-glow"
              size="lg"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default Index;
