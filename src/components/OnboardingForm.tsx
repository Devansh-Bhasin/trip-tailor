import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, ArrowRight } from "lucide-react";

export interface UserPreferences {
  interests: string[];
  budgetRange: string;
  transportation: string;
  groupSize: string;
  favoriteAreas: string[];
}

interface OnboardingFormProps {
  onComplete: (preferences: UserPreferences) => void;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    budgetRange: "",
    transportation: "",
    groupSize: "",
    favoriteAreas: [],
  });

  const interests = [
    { id: "food", label: "🍜 Food & Dining", icon: "🍜" },
    { id: "nature", label: "🌲 Nature & Parks", icon: "🌲" },
    { id: "culture", label: "🎨 Art & Culture", icon: "🎨" },
    { id: "shopping", label: "🛍️ Shopping", icon: "🛍️" },
    { id: "adventure", label: "⛰️ Adventure", icon: "⛰️" },
    { id: "relaxation", label: "☕ Relaxation", icon: "☕" },
  ];

  const areas = [
    { id: "vancouver", label: "Vancouver" },
    { id: "surrey", label: "Surrey" },
    { id: "richmond", label: "Richmond" },
    { id: "burnaby", label: "Burnaby" },
    { id: "langley", label: "Langley" },
    { id: "new-westminster", label: "New Westminster" },
  ];

  const toggleInterest = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const toggleArea = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteAreas: prev.favoriteAreas.includes(id)
        ? prev.favoriteAreas.filter((i) => i !== id)
        : [...prev.favoriteAreas, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return preferences.interests.length > 0;
      case 2:
        return preferences.budgetRange !== "";
      case 3:
        return preferences.transportation !== "" && preferences.groupSize !== "";
      case 4:
        return preferences.favoriteAreas.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-strong animate-scale-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TripTailor
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Tailored adventures for your taste, time, and budget
          </CardDescription>
          <div className="flex gap-2 justify-center pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-primary" : s < step ? "w-6 bg-primary/50" : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold mb-2">What are your interests?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      preferences.interests.includes(interest.id)
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{interest.icon}</div>
                    <div className="font-medium text-sm">{interest.label.split(" ").slice(1).join(" ")}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's your typical budget?</h3>
                <p className="text-sm text-muted-foreground mb-4">Per person, per adventure</p>
              </div>
              <RadioGroup value={preferences.budgetRange} onValueChange={(value) => setPreferences({ ...preferences, budgetRange: value })}>
                <div className="space-y-3">
                  {[
                    { value: "low", label: "Budget-friendly", desc: "Under $20 per person" },
                    { value: "medium", label: "Moderate", desc: "$20 - $50 per person" },
                    { value: "high", label: "Premium", desc: "$50+ per person" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        preferences.budgetRange === option.value
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                      onClick={() => setPreferences({ ...preferences, budgetRange: option.value })}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How do you usually travel?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose your preferred method</p>
                </div>
                <RadioGroup value={preferences.transportation} onValueChange={(value) => setPreferences({ ...preferences, transportation: value })}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "transit", label: "🚇 Transit", icon: "🚇" },
                      { value: "driving", label: "🚗 Driving", icon: "🚗" },
                      { value: "walking", label: "🚶 Walking", icon: "🚶" },
                      { value: "rideshare", label: "🚕 Rideshare", icon: "🚕" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          preferences.transportation === option.value
                            ? "border-primary bg-primary/5 shadow-glow"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                        onClick={() => setPreferences({ ...preferences, transportation: option.value })}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="cursor-pointer text-center">
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="font-medium text-sm">{option.label.split(" ")[1]}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Typical group size?</h3>
                </div>
                <RadioGroup value={preferences.groupSize} onValueChange={(value) => setPreferences({ ...preferences, groupSize: value })}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "solo", label: "Solo" },
                      { value: "couple", label: "Couple" },
                      { value: "small", label: "Small group (3-4)" },
                      { value: "large", label: "Large group (5+)" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          preferences.groupSize === option.value
                            ? "border-primary bg-primary/5 shadow-glow"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                        onClick={() => setPreferences({ ...preferences, groupSize: option.value })}
                      >
                        <RadioGroupItem value={option.value} id={`group-${option.value}`} className="sr-only" />
                        <Label htmlFor={`group-${option.value}`} className="cursor-pointer font-medium text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold mb-2">Favorite Metro Vancouver areas?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select your preferred locations</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => toggleArea(area.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      preferences.favoriteAreas.includes(area.id)
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium">{area.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1 gap-2">
              {step === 4 ? "Start Exploring" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
