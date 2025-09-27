import Header from "@/components/Header";
import DogForm from "@/components/DogForm";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AddDog() {
  const { user } = useAuth();
  const { toast } = useToast();

  const createDogMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/dogs', formData);
      return await response.json();
    },
    onSuccess: (dog) => {
      toast({
        title: "Dog Added Successfully!",
        description: `${dog.name} has been added to your shelter.`,
      });
      
      // Redirect to the dog's asset page
      setTimeout(() => {
        window.location.href = `/dogs/${dog.id}/assets`;
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Dog",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: any) => {
    if (!data.photo) {
      toast({
        title: "Photo Required",
        description: "Please select a photo for the dog.",
        variant: "destructive",
      });
      return;
    }

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('photo', data.photo);
    
    // Extract photo from data and stringify the rest
    const { photo, ...dogData } = data;
    formData.append('dogData', JSON.stringify(dogData));

    createDogMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        shelterName={user?.name || 'Your Shelter'}
        isLoggedIn={true}
        userType="shelter"
      />
      
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Dog</h1>
          <p className="text-muted-foreground">
            Add a new dog to your shelter and generate shareable content automatically.
          </p>
        </div>
        
        <DogForm onSubmit={handleFormSubmit} />
      </main>
    </div>
  );
}