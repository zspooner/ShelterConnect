import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import DogCard from "@/components/DogCard";
import MetricCard from "@/components/MetricCard";
import { useAuth } from "@/hooks/use-auth";

interface Dog {
  id: string;
  name: string;
  ageYears: number;
  sex: string;
  breedGuess?: string;
  weightLbs: number;
  photoUrl: string;
  status: string;
  euthanasiaRisk: boolean;
  adoptionDeadline?: string;
  clickCount: number;
  inquiryCount: number;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, isLoading: userLoading, logoutMutation } = useAuth();

  // Fetch dogs for the authenticated shelter
  const { data: dogs = [], isLoading: dogsLoading, error } = useQuery<Dog[]>({
    queryKey: ['/api/dogs'],
    enabled: !!user,
  });

  const handleAddDog = () => {
    console.log('Add dog clicked');
    window.location.href = "/dogs/new";
  };

  const handleDogClick = (dogId: string) => {
    console.log(`Dog clicked: ${dogId}`);
    window.location.href = `/dogs/${dogId}/assets`;
  };

  // Calculate urgency level for each dog
  const dogsWithUrgency = useMemo(() => {
    return dogs.map(dog => {
      let urgencyLevel = "None";
      if (dog.euthanasiaRisk) {
        urgencyLevel = "Critical";
      } else if (dog.adoptionDeadline) {
        const deadline = new Date(dog.adoptionDeadline);
        const now = new Date();
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) urgencyLevel = "Soon";
      }
      return { ...dog, urgencyLevel };
    });
  }, [dogs]);

  const filteredDogs = dogsWithUrgency.filter(dog => {
    const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dog.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalClicks = dogs.reduce((sum, dog) => sum + dog.clickCount, 0);
  const totalInquiries = dogs.reduce((sum, dog) => sum + dog.inquiryCount, 0);
  const urgentDogs = dogsWithUrgency.filter((d: any) => d.urgencyLevel === "Critical").length;

  // Show loading state
  if (userLoading || dogsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-accent-foreground" />
              <span className="text-lg">Loading dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
              <p className="text-muted-foreground">Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        shelterName={user?.name || 'Your Shelter'}
        isLoggedIn={true}
        userType="shelter"
        onLogout={() => logoutMutation.mutate()}
      />
      
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your dogs and track their reach
            </p>
          </div>
          <Button onClick={handleAddDog} data-testid="button-add-dog">
            <Plus className="h-4 w-4 mr-2" />
            Add Dog
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Dogs"
            value={dogs.length}
            description="Active profiles"
          />
          <MetricCard
            title="Total Views"
            value={totalClicks}
            description="All time"
          />
          <MetricCard
            title="Inquiries"
            value={totalInquiries}
            description="All time"
          />
          <MetricCard
            title="Urgent Dogs"
            value={urgentDogs}
            description="Need immediate help"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-dogs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="adopted">Adopted</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map(dog => (
            <DogCard 
              key={dog.id} 
              id={dog.id}
              name={dog.name}
              ageYears={dog.ageYears}
              sex={dog.sex}
              breedGuess={dog.breedGuess}
              weightLbs={dog.weightLbs}
              photoUrl={dog.photoUrl}
              status={dog.status as any}
              urgencyLevel={dog.urgencyLevel as any}
              adoptionDeadline={dog.adoptionDeadline}
              clicks={dog.clickCount}
              inquiries={dog.inquiryCount}
              onClick={() => handleDogClick(dog.id)}
            />
          ))}
        </div>

        {filteredDogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No dogs found</div>
            <Button onClick={handleAddDog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Dog
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}