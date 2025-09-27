import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PublicDogProfile from "@/components/PublicDogProfile";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DogData {
  id: string;
  name: string;
  ageYears: number;
  sex: string;
  breedGuess?: string;
  weightLbs: number;
  temperament: string;
  bio?: string;
  photoUrl: string;
  status: string;
  euthanasiaRisk: boolean;
  adoptionDeadline?: string;
  shelterId: string;
  slug: string;
  shelter?: {
    name: string;
    email: string;
    city: string;
    state: string;
  };
  assets?: any[];
}

export default function PublicDogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  // Fetch dog data
  const { data: dog, isLoading, error } = useQuery<DogData>({
    queryKey: [`/api/public/dogs/${slug}`],
    enabled: !!slug,
  });

  // Record click tracking
  useEffect(() => {
    if (dog?.id) {
      // Track the click - don't need to wait for response
      apiRequest('POST', `/api/public/dogs/${dog.slug}/click`, { source: 'Direct' }).catch(() => {
        // Ignore click tracking errors
      });
    }
  }, [dog?.id, dog?.slug]);

  // Submit inquiry mutation
  const submitInquiry = useMutation({
    mutationFn: async (inquiryData: any) => {
      if (!dog?.slug) throw new Error('No dog found');
      
      return apiRequest('POST', `/api/public/dogs/${dog.slug}/inquire`, inquiryData);
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Inquiry Submitted!",
        description: `Your adoption inquiry for ${dog?.name} has been sent to the shelter.`,
      });
      
      // Invalidate the dog query to refresh inquiry count
      queryClient.invalidateQueries({ queryKey: [`/api/public/dogs/${slug}`] });
    },
    onError: (error: any) => {
      // Show error message
      toast({
        title: "Failed to Submit Inquiry",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleInquiry = async (inquiryData: any) => {
    await submitInquiry.mutateAsync(inquiryData);
  };

  const handleShare = async (source: string) => {
    if (!dog?.slug) return;
    
    try {
      await apiRequest('POST', `/api/public/dogs/${dog.slug}/click`, { source });
    } catch (error) {
      // Ignore click tracking errors for sharing
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-accent-foreground" />
              <span className="text-lg">Loading dog profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Dog Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              The dog you're looking for doesn't exist or may have been adopted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert temperament string to array
  const temperamentArray = dog.temperament 
    ? dog.temperament.split(',').map(t => t.trim()) 
    : [];

  // Determine urgency level based on euthanasia risk and adoption deadline
  const getUrgencyLevel = () => {
    if (dog.euthanasiaRisk) return "Critical";
    if (dog.adoptionDeadline) {
      const deadline = new Date(dog.adoptionDeadline);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) return "Soon";
    }
    return "None";
  };

  // Find QR code asset
  const qrCodeAsset = dog.assets?.find(asset => asset.kind === 'QRCode');

  return (
    <div className="min-h-screen bg-background p-4">
      <PublicDogProfile
        name={dog.name}
        ageYears={dog.ageYears}
        sex={dog.sex}
        breedGuess={dog.breedGuess}
        weightLbs={dog.weightLbs}
        temperament={temperamentArray}
        bio={dog.bio}
        photoUrl={dog.photoUrl}
        status={dog.status as any}
        urgencyLevel={getUrgencyLevel() as any}
        adoptionDeadline={dog.adoptionDeadline}
        shelterName={dog.shelter?.name || 'Unknown Shelter'}
        shelterEmail={dog.shelter?.email || ''}
        city={dog.shelter?.city || 'Unknown'}
        state={dog.shelter?.state || 'Unknown'}
        qrCodeUrl={qrCodeAsset?.payload?.url}
        onInquiry={handleInquiry}
        onShare={handleShare}
      />
    </div>
  );
}