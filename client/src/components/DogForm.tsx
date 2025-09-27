import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Image } from "lucide-react";

interface DogFormData {
  name: string;
  ageYears: string;
  sex: string;
  breedGuess: string;
  weightLbs: string;
  temperament: string[];
  bio: string;
  adoptionDeadline: string;
  euthanasiaRisk: boolean;
  photo: File | null;
}

interface DogFormProps {
  onSubmit?: (data: DogFormData) => void;
  className?: string;
}

const temperamentOptions = [
  "Calm", "Active", "GoodWithDogs", "GoodWithKids", "SpecialNeeds"
];

export default function DogForm({ onSubmit, className }: DogFormProps) {
  const [formData, setFormData] = useState<DogFormData>({
    name: "",
    ageYears: "",
    sex: "",
    breedGuess: "",
    weightLbs: "",
    temperament: [],
    bio: "",
    adoptionDeadline: "",
    euthanasiaRisk: false,
    photo: null
  });

  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleInputChange = (field: keyof DogFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemperamentChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      temperament: checked 
        ? [...prev.temperament, option]
        : prev.temperament.filter(t => t !== option)
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dog form submitted:', formData);
    onSubmit?.(formData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Add New Dog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Dog preview" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('photo')?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('photo')?.click()}
                      data-testid="button-upload-photo"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG or PNG, max 8MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Buddy"
                data-testid="input-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age (years) *</Label>
              <Input
                id="age"
                type="number"
                step="0.5"
                value={formData.ageYears}
                onChange={(e) => handleInputChange('ageYears', e.target.value)}
                placeholder="e.g. 3"
                data-testid="input-age"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select onValueChange={(value) => handleInputChange('sex', value)}>
                <SelectTrigger data-testid="select-sex">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs) *</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weightLbs}
                onChange={(e) => handleInputChange('weightLbs', e.target.value)}
                placeholder="e.g. 65"
                data-testid="input-weight"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed Guess</Label>
            <Input
              id="breed"
              value={formData.breedGuess}
              onChange={(e) => handleInputChange('breedGuess', e.target.value)}
              placeholder="e.g. Golden Retriever Mix"
              data-testid="input-breed"
            />
          </div>

          {/* Temperament */}
          <div className="space-y-2">
            <Label>Temperament</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {temperamentOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.temperament.includes(option)}
                    onCheckedChange={(checked) => 
                      handleTemperamentChange(option, checked as boolean)
                    }
                    data-testid={`checkbox-temperament-${option.toLowerCase()}`}
                  />
                  <Label htmlFor={option} className="text-sm">
                    {option.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about this dog's personality..."
              className="min-h-20"
              data-testid="textarea-bio"
            />
          </div>

          {/* Urgency Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="text-base font-medium">Urgency Settings</Label>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Adoption Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.adoptionDeadline}
                onChange={(e) => handleInputChange('adoptionDeadline', e.target.value)}
                data-testid="input-deadline"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="euthanasia-risk"
                checked={formData.euthanasiaRisk}
                onCheckedChange={(checked) => 
                  handleInputChange('euthanasiaRisk', checked as boolean)
                }
                data-testid="checkbox-euthanasia-risk"
              />
              <Label htmlFor="euthanasia-risk" className="text-sm">
                At risk of euthanasia
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            data-testid="button-submit-dog"
          >
            Add Dog & Generate Content
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}