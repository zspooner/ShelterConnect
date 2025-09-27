import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Share, Users, Zap } from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  const handleGetStarted = (type: "shelter" | "volunteer") => {
    console.log(`Get started clicked: ${type}`);
    if (type === "shelter") {
      window.location.href = "/auth/register";
    } else {
      window.location.href = "/amplify";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-accent-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Amplify Every Dog's 
            <span className="text-accent-foreground"> Chance</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your shelter dogs into social media stars. Generate shareable content automatically and connect with volunteers who amplify your reach across every platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => handleGetStarted("shelter")}
              data-testid="button-shelter-signup"
            >
              <Heart className="h-5 w-5 mr-2" />
              For Shelters
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleGetStarted("volunteer")}
              data-testid="button-volunteer-signup"
            >
              <Users className="h-5 w-5 mr-2" />
              Volunteer to Help
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Save More Lives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-accent-foreground mb-4" />
                <CardTitle>Auto-Generate Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload one photo and get Instagram posts, X/Twitter content, and shareable images with QR codes automatically.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Share className="h-12 w-12 mx-auto text-accent-foreground mb-4" />
                <CardTitle>Volunteer Amplification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Volunteers claim and share your content across their networks, multiplying your reach without extra work.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 mx-auto text-accent-foreground mb-4" />
                <CardTitle>Public Adoption Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Beautiful public pages for each dog with inquiry forms, share buttons, and QR codes for offline sharing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Upload Your Dog</h3>
                <p className="text-muted-foreground">
                  Create a profile with one photo and basic info. Set urgency flags for dogs with adoption deadlines.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Generate Everything</h3>
                <p className="text-muted-foreground">
                  Get captions, social images, public pages, and volunteer tasks created automatically in seconds.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Volunteers Amplify</h3>
                <p className="text-muted-foreground">
                  Local volunteers claim tasks and share your content, extending your reach across all social platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Save More Lives?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join shelters across the country using ShelterDog Amplify to find homes faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => handleGetStarted("shelter")}
              data-testid="button-cta-shelter"
            >
              Get Started - Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleGetStarted("volunteer")}
              data-testid="button-cta-volunteer"
            >
              Volunteer Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 ShelterDog Amplify. Made with ❤️ for shelter dogs everywhere.</p>
        </div>
      </footer>
    </div>
  );
}