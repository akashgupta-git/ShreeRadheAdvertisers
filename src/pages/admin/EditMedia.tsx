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
    imageUrl: '', 
  });

  useEffect(() => {
    if (media) {
      setFormData({
        customId: media.id || '',
        name: media.name || '',
        type: media.type || '',
        state: media.state || '',
        district: media.district || '',
        city: media.city || '',
        address: media.address || '',
        size: media.size || '',
        lighting: media.lighting || '',
        facing: media.facing || '',
        pricePerMonth: String(media.pricePerMonth || ''),
        imageUrl: media.imageUrl || media.image || '', 
      });
      setPreviewUrl(media.imageUrl || media.image || null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // 1. Upload to Hostinger
      if (selectedFile && isBackendConfigured()) {
        const uploadResponse: any = await uploadImage.mutateAsync({ 
          file: selectedFile, 
          folder: 'media' 
        });
        finalImageUrl = uploadResponse.url; 
      }

      if (isBackendConfigured() && media) {
        // 2. Submit with explicit imageUrl mapping
        await updateMedia.mutateAsync({
          id: (media._id || id)!,
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
            imageUrl: finalImageUrl, // FIX: Save to imageUrl field
            landmark: formData.customId
          }
        });
      }

      toast({ title: "Updated Successfully" });
      navigate('/admin/media');
    } catch (error: any) {
      console.error("Update Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message, 
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-1">Edit Media</h1>
          <p className="text-muted-foreground font-mono text-sm">{formData.customId}</p>
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
                    placeholder="e.g., SRA-DURG-001"
                    value={formData.customId}
                    onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Media Name *</Label>
                  <Input
                    id="name"
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
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City/Town *</Label>
                  <Input 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    disabled={!formData.district}
                  />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea 
                  id="address"
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
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 cursor-pointer">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full aspect-video object-cover rounded mb-2" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-xs">{selectedFile ? selectedFile.name : 'Change image'}</p>
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
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  required
                />
              </div>
            </Card>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditMedia;