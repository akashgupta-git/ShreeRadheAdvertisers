// Manage States, Districts and Cities
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, MapPin, Building2, Map, Lock, ChevronRight } from "lucide-react";
import { useLocationData, DEFAULT_STATE, CHHATTISGARH_DISTRICTS, STATE_DISTRICTS } from "@/contexts/LocationDataContext";
import { toast } from "sonner";

interface LocationManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationManagementDialog({ open, onOpenChange }: LocationManagementDialogProps) {
  const {
    activeState,
    states,
    cities,
    setActiveState,
    addState,
    removeState,
    addDistrict,
    removeDistrict,
    addCity,
    removeCity,
    getDistrictsForState,
  } = useLocationData();

  const [newState, setNewState] = useState("");
  const [selectedStateForDistrict, setSelectedStateForDistrict] = useState(activeState);
  const [newDistrict, setNewDistrict] = useState("");
  const [selectedDistrictForCity, setSelectedDistrictForCity] = useState("");
  const [newCity, setNewCity] = useState("");

  // Quick add states
  const availableQuickStates = Object.keys(STATE_DISTRICTS).filter(s => !states.includes(s));

  const handleAddState = () => {
    if (newState.trim()) {
      addState(newState.trim());
      setNewState("");
      toast.success(`State "${newState.trim()}" added`);
    }
  };

  const handleQuickAddState = (state: string) => {
    addState(state);
    toast.success(`${state} added with ${STATE_DISTRICTS[state]?.length || 0} districts`);
  };

  const handleAddDistrict = () => {
    if (newDistrict.trim()) {
      addDistrict(newDistrict.trim(), selectedStateForDistrict);
      setNewDistrict("");
      toast.success(`District "${newDistrict.trim()}" added to ${selectedStateForDistrict}`);
    }
  };

  const handleAddCity = () => {
    if (selectedDistrictForCity && newCity.trim()) {
      addCity(selectedDistrictForCity, newCity.trim());
      setNewCity("");
      toast.success(`City "${newCity.trim()}" added to ${selectedDistrictForCity}`);
    }
  };

  const currentDistricts = getDistrictsForState(selectedStateForDistrict);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Manage Locations
          </DialogTitle>
          <DialogDescription>
            Manage operating regions - states, districts, and cities.
          </DialogDescription>
        </DialogHeader>

        {/* Active State Selector */}
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <Map className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Active Operating State</p>
            <Select value={activeState} onValueChange={setActiveState}>
              <SelectTrigger className="h-8 mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>
                    {state} {state === DEFAULT_STATE && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="districts" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="states">
              <Map className="h-4 w-4 mr-2" />
              States ({states.length})
            </TabsTrigger>
            <TabsTrigger value="districts">
              <Building2 className="h-4 w-4 mr-2" />
              Districts
            </TabsTrigger>
            <TabsTrigger value="cities">
              <MapPin className="h-4 w-4 mr-2" />
              Cities
            </TabsTrigger>
          </TabsList>

          {/* States Tab */}
          <TabsContent value="states" className="space-y-4 mt-4">
            {/* Quick Add Section */}
            {availableQuickStates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quick Add (Pre-configured with districts)</Label>
                <div className="flex flex-wrap gap-2">
                  {availableQuickStates.map(state => (
                    <Button 
                      key={state} 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickAddState(state)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {state}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Enter state name..."
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
              />
              <Button onClick={handleAddState} disabled={!newState.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <ScrollArea className="h-[250px] border rounded-md p-4">
              <div className="flex flex-wrap gap-2">
                {states.map(state => (
                  <Badge key={state} variant={state === activeState ? "default" : "secondary"} className="pl-3 pr-1 py-1.5 text-sm">
                    {state === DEFAULT_STATE && <Lock className="h-3 w-3 mr-1" />}
                    {state}
                    {state !== DEFAULT_STATE && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 hover:bg-destructive/20"
                        onClick={() => {
                          removeState(state);
                          toast.success(`State "${state}" removed`);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" /> {DEFAULT_STATE} is the default state and cannot be removed.
            </p>
          </TabsContent>

          {/* Districts Tab */}
          <TabsContent value="districts" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Select State</Label>
                <Select value={selectedStateForDistrict} onValueChange={setSelectedStateForDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter district name..."
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDistrict()}
                />
                <Button onClick={handleAddDistrict} disabled={!newDistrict.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[220px] border rounded-md p-4">
              {currentDistricts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No districts in {selectedStateForDistrict}. Add one above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentDistricts.map(district => {
                    const isDefault = selectedStateForDistrict === DEFAULT_STATE && CHHATTISGARH_DISTRICTS.includes(district);
                    return (
                      <Badge key={district} variant="outline" className="pl-3 pr-1 py-1.5 text-sm">
                        {district}
                        {!isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 hover:bg-destructive/20"
                            onClick={() => {
                              removeDistrict(district, selectedStateForDistrict);
                              toast.success(`District "${district}" removed`);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              {selectedStateForDistrict === DEFAULT_STATE 
                ? `Default ${DEFAULT_STATE} districts cannot be removed.`
                : "Custom districts can be added and removed."}
            </p>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Select District</Label>
                <Select value={selectedDistrictForCity} onValueChange={setSelectedDistrictForCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a district..." />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <div key={state}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" /> {state}
                        </div>
                        {getDistrictsForState(state).map(district => (
                          <SelectItem key={`${state}-${district}`} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city/town name..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                  disabled={!selectedDistrictForCity}
                />
                <Button onClick={handleAddCity} disabled={!selectedDistrictForCity || !newCity.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[220px] border rounded-md p-4">
              {selectedDistrictForCity ? (
                (cities[selectedDistrictForCity] || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No cities added in {selectedDistrictForCity}. Add one above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(cities[selectedDistrictForCity] || []).map(city => (
                      <Badge key={city} variant="outline" className="pl-3 pr-1 py-1.5 text-sm">
                        {city}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1 hover:bg-destructive/20"
                          onClick={() => {
                            removeCity(selectedDistrictForCity, city);
                            toast.success(`City "${city}" removed`);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Select a district to view/add cities.
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}