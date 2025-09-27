import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import Header from "@/components/Header";
import DogCard from "@/components/DogCard";
import MetricCard from "@/components/MetricCard";

export default function Dashboard() {
  //todo: remove mock functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockShelter = {
    name: "Happy Paws Rescue",
    email: "contact@happypawsrescue.org"
  };

  const mockDogs = [
    {
      id: "1",
      name: "Buddy",
      ageYears: 3,
      sex: "Male",
      breedGuess: "Golden Retriever Mix",
      weightLbs: 65,
      photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      status: "Available" as const,
      urgencyLevel: "Critical" as const,
      adoptionDeadline: "Oct 15",
      clicks: 24,
      inquiries: 3
    },
    {
      id: "2",
      name: "Luna",
      ageYears: 2,
      sex: "Female", 
      breedGuess: "Border Collie",
      weightLbs: 45,
      photoUrl: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop",
      status: "Available" as const,
      urgencyLevel: "Soon" as const,
      adoptionDeadline: "Oct 22",
      clicks: 18,
      inquiries: 1
    },
    {
      id: "3",
      name: "Max",
      ageYears: 5,
      sex: "Male",
      breedGuess: "German Shepherd",
      weightLbs: 75,
      photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
      status: "Adopted" as const,
      clicks: 42,
      inquiries: 8
    },
    {
      id: "4",
      name: "Bella",
      ageYears: 1,
      sex: "Female",
      breedGuess: "Labrador Mix",
      weightLbs: 35,
      photoUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
      status: "Hold" as const,
      clicks: 15,
      inquiries: 2
    }
  ];

  const handleAddDog = () => {
    console.log('Add dog clicked');
    window.location.href = "/dogs/new";
  };

  const handleDogClick = (dogId: string) => {
    console.log(`Dog clicked: ${dogId}`);
    window.location.href = `/dogs/${dogId}/assets`;
  };

  const filteredDogs = mockDogs.filter(dog => {
    const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dog.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        shelterName={mockShelter.name}
        isLoggedIn={true}
        userType="shelter"
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
            value={mockDogs.length}
            description="Active profiles"
          />
          <MetricCard
            title="Total Views"
            value="1,234"
            description="Last 7 days"
            trend="up"
            trendValue="+12%"
          />
          <MetricCard
            title="Inquiries"
            value="14"
            description="This week"
            trend="up"
            trendValue="+3"
          />
          <MetricCard
            title="Urgent Dogs"
            value={mockDogs.filter(d => d.urgencyLevel === "Critical").length}
            description="Need immediate help"
            trend="down"
            trendValue="-1"
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
              {...dog} 
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