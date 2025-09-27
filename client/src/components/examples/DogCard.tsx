import DogCard from '../DogCard';

export default function DogCardExample() {
  //todo: remove mock functionality
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
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {mockDogs.map(dog => (
        <DogCard key={dog.id} {...dog} />
      ))}
    </div>
  );
}