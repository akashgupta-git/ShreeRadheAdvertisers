// Context for managing states, districts, and cities
// Pre-populated with Chhattisgarh as default operating state

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sra_location_data_v3';

// Default Operating State
export const DEFAULT_STATE = 'Chhattisgarh';

// Pre-populated districts for Chhattisgarh (all 33 districts)
const CHHATTISGARH_DISTRICTS = [
  'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara',
  'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg',
  'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham',
  'Kanker', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 'Korba', 'Koriya',
  'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur',
  'Raigarh', 'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh', 'Shakti',
  'Sukma', 'Surajpur', 'Surguja'
];

// Pre-populated districts for common expansion states
const STATE_DISTRICTS: Record<string, string[]> = {
  'Chhattisgarh': CHHATTISGARH_DISTRICTS,
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind',
    'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone'
  ],
  'Odisha': [
    'Khordha', 'Cuttack', 'Ganjam', 'Sundargarh', 'Balasore', 'Mayurbhanj', 'Jajpur',
    'Sambalpur', 'Koraput', 'Puri', 'Kendujhar', 'Bargarh', 'Bhadrak', 'Angul'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati',
    'Kolhapur', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih',
    'Ramgarh', 'Dumka', 'Chaibasa'
  ]
};

interface LocationData {
  activeState: string;
  states: string[];
  districts: Record<string, string[]>;
  cities: Record<string, string[]>;
}

interface LocationDataContextType {
  activeState: string;
  states: string[];
  districts: string[];
  allDistricts: Record<string, string[]>;
  cities: Record<string, string[]>;
  setActiveState: (state: string) => void;
  addState: (state: string) => void;
  removeState: (state: string) => void;
  addDistrict: (district: string, state?: string) => void;
  removeDistrict: (district: string, state?: string) => void;
  addCity: (district: string, city: string) => void;
  removeCity: (district: string, city: string) => void;
  getCitiesForDistrict: (district: string) => string[];
  getDistrictsForState: (state: string) => string[];
}

const getDefaultData = (): LocationData => ({
  activeState: DEFAULT_STATE,
  states: [DEFAULT_STATE],
  districts: { [DEFAULT_STATE]: [...CHHATTISGARH_DISTRICTS] },
  cities: {},
});

const LocationDataContext = createContext<LocationDataContextType | undefined>(undefined);

export function LocationDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LocationData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure Chhattisgarh is always present with all districts
        if (!parsed.states?.includes(DEFAULT_STATE)) {
          parsed.states = [DEFAULT_STATE, ...(parsed.states || [])];
        }
        if (!parsed.districts?.[DEFAULT_STATE]) {
          parsed.districts = { ...parsed.districts, [DEFAULT_STATE]: [...CHHATTISGARH_DISTRICTS] };
        } else {
          // Merge default districts
          parsed.districts[DEFAULT_STATE] = [...new Set([...CHHATTISGARH_DISTRICTS, ...parsed.districts[DEFAULT_STATE]])].sort();
        }
        return parsed;
      }
      return getDefaultData();
    } catch {
      return getDefaultData();
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setActiveState = useCallback((state: string) => {
    if (data.states.includes(state)) {
      setData(prev => ({ ...prev, activeState: state }));
    }
  }, [data.states]);

  const addState = useCallback((state: string) => {
    const trimmed = state.trim();
    if (trimmed && !data.states.includes(trimmed)) {
      setData(prev => ({
        ...prev,
        states: [...prev.states, trimmed].sort(),
        districts: {
          ...prev.districts,
          [trimmed]: STATE_DISTRICTS[trimmed] || [],
        },
      }));
    }
  }, [data.states]);

  const removeState = useCallback((state: string) => {
    // Don't allow removing the default state
    if (state === DEFAULT_STATE) return;
    
    setData(prev => {
      const newDistricts = { ...prev.districts };
      delete newDistricts[state];
      
      // Remove cities for all districts in this state
      const newCities = { ...prev.cities };
      (prev.districts[state] || []).forEach(district => {
        delete newCities[district];
      });
      
      return {
        ...prev,
        states: prev.states.filter(s => s !== state),
        districts: newDistricts,
        cities: newCities,
        activeState: prev.activeState === state ? DEFAULT_STATE : prev.activeState,
      };
    });
  }, []);

  const addDistrict = useCallback((district: string, state?: string) => {
    const trimmed = district.trim();
    const targetState = state || data.activeState;
    if (!trimmed) return;
    
    setData(prev => {
      const stateDistricts = prev.districts[targetState] || [];
      if (stateDistricts.includes(trimmed)) return prev;
      
      return {
        ...prev,
        districts: {
          ...prev.districts,
          [targetState]: [...stateDistricts, trimmed].sort(),
        },
      };
    });
  }, [data.activeState]);

  const removeDistrict = useCallback((district: string, state?: string) => {
    const targetState = state || data.activeState;
    // Don't allow removing default Chhattisgarh districts
    if (targetState === DEFAULT_STATE && CHHATTISGARH_DISTRICTS.includes(district)) return;
    
    setData(prev => {
      const stateDistricts = prev.districts[targetState] || [];
      const newCities = { ...prev.cities };
      delete newCities[district];
      
      return {
        ...prev,
        districts: {
          ...prev.districts,
          [targetState]: stateDistricts.filter(d => d !== district),
        },
        cities: newCities,
      };
    });
  }, [data.activeState]);

  const addCity = useCallback((district: string, city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    
    setData(prev => {
      const districtCities = prev.cities[district] || [];
      if (districtCities.includes(trimmed)) return prev;
      
      return {
        ...prev,
        cities: {
          ...prev.cities,
          [district]: [...districtCities, trimmed].sort(),
        },
      };
    });
  }, []);

  const removeCity = useCallback((district: string, city: string) => {
    setData(prev => {
      const districtCities = prev.cities[district] || [];
      return {
        ...prev,
        cities: {
          ...prev.cities,
          [district]: districtCities.filter(c => c !== city),
        },
      };
    });
  }, []);

  const getCitiesForDistrict = useCallback((district: string) => {
    return data.cities[district] || [];
  }, [data.cities]);

  const getDistrictsForState = useCallback((state: string) => {
    return data.districts[state] || [];
  }, [data.districts]);

  const value: LocationDataContextType = {
    activeState: data.activeState,
    states: data.states,
    districts: data.districts[data.activeState] || [],
    allDistricts: data.districts,
    cities: data.cities,
    setActiveState,
    addState,
    removeState,
    addDistrict,
    removeDistrict,
    addCity,
    removeCity,
    getCitiesForDistrict,
    getDistrictsForState,
  };

  return (
    <LocationDataContext.Provider value={value}>
      {children}
    </LocationDataContext.Provider>
  );
}

export function useLocationData() {
  const context = useContext(LocationDataContext);
  if (context === undefined) {
    throw new Error('useLocationData must be used within a LocationDataProvider');
  }
  return context;
}

// Export for use in components
export { CHHATTISGARH_DISTRICTS, STATE_DISTRICTS };