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
import Register from "@/pages/Register";
import PublicDogPage from "@/pages/PublicDogPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dash" component={Dashboard} />
      <Route path="/dogs/new" component={AddDog} />
      <Route path="/amplify" component={AmplifyBoard} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/d/:slug" component={PublicDogPage} />
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