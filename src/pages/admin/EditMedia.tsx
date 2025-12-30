/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mediaTypes } from "@/lib/data";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { useMediaById, useUpdateMedia, useUploadMediaImage } from "@/hooks/api/useMedia";
import { isBackendConfigured } from "@/lib/api/config";
import { useLocationData } from "@/contexts/LocationDataContext";

const EditMedia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { data: media, isLoading } = useMediaById(id || "");
  const updateMedia = useUpdateMedia();
  const uploadImage = useUploadMediaImage();
  const { states, getCitiesForDistrict, getDistrictsForState } = useLocationData();
  
  const [formData, setFormData] = useState({
    customId: '', 
    name: '',
    type: '',
    state: '',
    district: '',
    city: '',
    address: '',
    size: '',
    lighting: '',
    facing: '',
    pricePerMonth: '',
  });

  // Populate form with existing data once loaded
  useEffect(() => {
    if (media) {
      setFormData({
        customId: media.id || media.landmark || '', 
        name: media.name,
        type: media.type,
        state: media.state,
        district: media.district,
        city: media.city,
        address: media.address || '',
        size: media.size || '',
        lighting: media.lighting || '',
        facing: media.facing || '',
        pricePerMonth: String(media.pricePerMonth),
      });
      setPreviewUrl(media.image || null);
    }
  }, [media]);

  const availableDistricts = getDistrictsForState(formData.state);
  const availableCities = getCitiesForDistrict(formData.district);

  const handleStateChange = (state: string) => {
    setFormData({ ...formData, state, district: '', city: '' });
  };

  const handleDistrictChange = (district: string) => {
    setFormData({ ...formData, district, city: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!media && !isLoading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Media not found</h1>
        <Button onClick={() => navigate('/admin/media')}>Back to Media</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let permanentImageUrl = previewUrl;

      if (selectedFile && isBackendConfigured()) {
        const uploadResponse: any = await uploadImage.mutateAsync({ file: selectedFile, folder: 'media' });
        permanentImageUrl = uploadResponse.url; 
      }

      if (isBackendConfigured() && id) {
        await updateMedia.mutateAsync({
          id,
          data: {
            id: formData.customId,
            name: formData.name,
            type: formData.type as any,
            state: formData.state,
            district: formData.district,
            city: formData.city,
            address: formData.address,
            size: formData.size,
            lighting: formData.lighting as any,
            facing: formData.facing,
            pricePerMonth: Number(formData.pricePerMonth),
            image: permanentImageUrl || undefined,
            landmark: formData.customId
          }
        });
      }

      toast({ title: "Updated Successfully" });
      navigate('/admin/media');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-1">Edit Media</h1>
          <p className="text-muted-foreground">Update media location: {formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="customId">Media ID *</Label>
                  <Input 
                    id="customId"
                    placeholder="e.g., SRA-RPR-001"
                    value={formData.customId}
                    onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Your custom identifier</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Media Name *</Label>
                  <Input 
                    id="name"
                    placeholder="e.g., Telibandha Unipole 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="type">Media Type *</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={formData.state} onValueChange={handleStateChange}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Select 
                    value={formData.district}
                    onValueChange={handleDistrictChange}
                    disabled={!formData.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City/Town *</Label>
                  {availableCities.length > 0 ? (
                    <Select 
                      value={formData.city}
                      onValueChange={(v) => setFormData({ ...formData, city: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      placeholder={!formData.district ? "Select district first" : "Enter city name"}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!formData.district}
                    />
                  )}
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea 
                  id="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border/50">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input 
                    id="size"
                    placeholder="e.g., 40x20 ft"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lighting</Label>
                  <Select 
                    value={formData.lighting}
                    onValueChange={(v) => setFormData({ ...formData, lighting: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select lighting" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Front Lit">Front Lit</SelectItem>
                      <SelectItem value="Back Lit">Back Lit</SelectItem>
                      <SelectItem value="Non-Lit">Non-Lit</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facing">Facing Direction</Label>
                  <Input 
                    id="facing"
                    placeholder="e.g., Towards Railway Station"
                    value={formData.facing}
                    onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card border-border/50">
              <h3 className="font-semibold mb-4">Media Image</h3>
              <input type="file" id="media-image" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="media-image">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 cursor-pointer">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  ) : (
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">{selectedFile ? selectedFile.name : 'Click to upload new image'}</p>
                </div>
              </label>
            </Card>

            <Card className="p-6 bg-card border-border/50">
              <h3 className="font-semibold mb-4">Pricing</h3>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Rate (₹) *</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  required
                />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border/50">
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Update Media</>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditMedia;
