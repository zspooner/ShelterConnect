import Header from "@/components/Header";
import DogForm from "@/components/DogForm";

export default function AddDog() {
  const mockShelter = {
    name: "Happy Paws Rescue",
    email: "contact@happypawsrescue.org"
  };

  const handleFormSubmit = (data: any) => {
    console.log('Dog form submitted:', data);
    // After successful submission, redirect to assets page
    setTimeout(() => {
      window.location.href = `/dogs/new-dog-id/assets`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        shelterName={mockShelter.name}
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