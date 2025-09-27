import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import AddDog from "@/pages/AddDog";
import AmplifyBoard from "@/pages/AmplifyBoard";
import Login from "@/pages/Login";
import PublicDogProfile from "@/components/PublicDogProfile";
import NotFound from "@/pages/not-found";

function Router() {
  //todo: remove mock functionality
  const mockDog = {
    name: "Buddy",
    ageYears: 3,
    sex: "Male",
    breedGuess: "Golden Retriever Mix",
    weightLbs: 65,
    temperament: ["Calm", "GoodWithKids", "Active"],
    bio: "Buddy is a sweet, gentle soul who loves playing fetch and cuddling on the couch. He's great with children and gets along well with other dogs. Buddy is house-trained and knows basic commands. He would thrive in a home with a yard where he can run and play.",
    photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop",
    status: "Available" as const,
    urgencyLevel: "Critical" as const,
    adoptionDeadline: "2024-10-15",
    shelterName: "Happy Paws Rescue",
    shelterEmail: "adopt@happypawsrescue.org",
    city: "Austin",
    state: "TX",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=https://example.com/d/buddy-austin-tx-1234"
  };

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dash" component={Dashboard} />
      <Route path="/dogs/new" component={AddDog} />
      <Route path="/amplify" component={AmplifyBoard} />
      <Route path="/auth/login" component={Login} />
      <Route path="/d/:slug">
        {() => (
          <div className="min-h-screen bg-background p-4">
            <PublicDogProfile {...mockDog} />
          </div>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;