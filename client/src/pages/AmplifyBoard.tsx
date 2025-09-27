import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users } from "lucide-react";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";

export default function AmplifyBoard() {
  //todo: remove mock functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const mockTasks = [
    {
      id: "1",
      dogName: "Buddy",
      dogPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop",
      channel: "IG" as const,
      status: "Open" as const,
      location: "Austin, TX",
      expiresAt: "in 2 days",
      urgencyLevel: "Critical" as const
    },
    {
      id: "2",
      dogName: "Luna",
      dogPhoto: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100&h=100&fit=crop",
      channel: "X" as const,
      status: "Claimed" as const,
      location: "Austin, TX",
      expiresAt: "in 4 days",
      claimedBy: "Sarah M."
    },
    {
      id: "3",
      dogName: "Max",
      dogPhoto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop",
      channel: "FB" as const,
      status: "Open" as const,
      location: "San Antonio, TX",
      expiresAt: "in 3 days"
    },
    {
      id: "4",
      dogName: "Bella",
      dogPhoto: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop",
      channel: "TikTok" as const,
      status: "Done" as const,
      location: "Dallas, TX",
      expiresAt: "yesterday"
    },
    {
      id: "5",
      dogName: "Rocky",
      dogPhoto: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
      channel: "Nextdoor" as const,
      status: "Open" as const,
      location: "Houston, TX",
      expiresAt: "in 5 days",
      urgencyLevel: "Soon" as const
    },
    {
      id: "6",
      dogName: "Daisy",
      dogPhoto: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop",
      channel: "IG" as const,
      status: "Open" as const,
      location: "Fort Worth, TX",
      expiresAt: "in 1 day",
      urgencyLevel: "Critical" as const
    }
  ];

  const handleTaskClaim = (taskId: string) => {
    console.log(`Task claimed: ${taskId}`);
  };

  const handleTaskComplete = (taskId: string) => {
    console.log(`Task completed: ${taskId}`);
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.dogName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === "all" || task.channel === channelFilter;
    const matchesLocation = locationFilter === "all" || task.location.includes(locationFilter);
    return matchesSearch && matchesChannel && matchesLocation;
  });

  const openTasks = filteredTasks.filter(t => t.status === "Open").length;
  const urgentTasks = filteredTasks.filter(t => t.urgencyLevel === "Critical").length;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={false}
        userType="volunteer"
      />
      
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Users className="h-12 w-12 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Volunteer Amplify Board</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help shelter dogs find homes by sharing their stories on social media. 
            Claim a task and use the provided content to amplify their reach.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{openTasks}</div>
            <div className="text-sm text-muted-foreground">Open Tasks</div>
          </div>
          <div className="bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-danger">{urgentTasks}</div>
            <div className="text-sm text-muted-foreground">Urgent Dogs</div>
          </div>
          <div className="bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-muted-foreground">Active Volunteers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by dog name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-tasks"
            />
          </div>
          
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full lg:w-48" data-testid="select-channel-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="IG">Instagram</SelectItem>
              <SelectItem value="X">X (Twitter)</SelectItem>
              <SelectItem value="FB">Facebook</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="Nextdoor">Nextdoor</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full lg:w-48" data-testid="select-location-filter">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Austin">Austin, TX</SelectItem>
              <SelectItem value="San Antonio">San Antonio, TX</SelectItem>
              <SelectItem value="Dallas">Dallas, TX</SelectItem>
              <SelectItem value="Houston">Houston, TX</SelectItem>
              <SelectItem value="Fort Worth">Fort Worth, TX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Tasks */}
        {urgentTasks > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-danger text-white">URGENT</Badge>
              <h2 className="text-xl font-semibold">Critical Cases - Need Immediate Help</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks
                .filter(task => task.urgencyLevel === "Critical" && task.status === "Open")
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    {...task}
                    onClaim={() => handleTaskClaim(task.id)}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* All Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                {...task}
                onClaim={() => handleTaskClaim(task.id)}
                onComplete={() => handleTaskComplete(task.id)}
              />
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No tasks found matching your filters</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria or check back later for new tasks.
            </p>
          </div>
        )}

        {/* How to Help */}
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Help</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Claim a task</strong> for a dog you want to help</p>
            <p>2. <strong>Get the content</strong> - we'll provide captions and images</p>
            <p>3. <strong>Share on your platform</strong> - post to your social media accounts</p>
            <p>4. <strong>Mark as complete</strong> - let us know when you've shared</p>
          </div>
        </div>
      </main>
    </div>
  );
}