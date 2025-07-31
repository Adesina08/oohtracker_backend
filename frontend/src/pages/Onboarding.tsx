import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { Camera, Gift, TrendingUp } from "lucide-react";

const slides = [
  {
    icon: Camera,
    title: "Capture Your Meals",
    description:
      "Upload photos or videos of your snacks and our AI will analyse them for you."
  },
  {
    icon: Gift,
    title: "Earn Points & Rewards",
    description:
      "Collect points for every log and redeem them for awesome rewards."
  },
  {
    icon: TrendingUp,
    title: "Gain Insights",
    description:
      "Track your eating habits and discover trends in your consumption."
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("onboardingCompleted")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const next = () => {
    if (current === slides.length - 1) {
      localStorage.setItem("onboardingCompleted", "true");
      navigate("/dashboard", { replace: true });
    } else {
      api?.scrollNext();
    }
  };

  return (
    <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gradient">Welcome to SnackTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel setApi={setApi} className="mb-6">
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index} className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <slide.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{slide.title}</h3>
                    <p className="text-muted-foreground">{slide.description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="flex justify-center space-x-2 mb-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${current === i ? "bg-blue-600" : "bg-blue-200"}`}
              />
            ))}
          </div>

          <Button onClick={next} className="w-full gradient-primary hover-glow text-white">
            {current === slides.length - 1 ? "Get Started" : "Next"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
