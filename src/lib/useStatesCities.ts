import { useQuery } from '@tanstack/react-query';

type StateData = {
  name: string;
  cities: string[];
};

type StatesCities = Record<string, StateData>;

type CityData = {
  name: string;
  lat: string;
  lng: string;
  country: string;
  admin1: string;
  admin2: string;
};

// State abbreviation mapping
const stateMapping: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Dynamic import for cities data
const getCitiesData = async (): Promise<CityData[]> => {
  const citiesData = await import('cities.json');
  return citiesData.default as CityData[];
};

// Process cities data to group by US states
const processUSCitiesData = async (): Promise<StatesCities> => {
  const allCities = await getCitiesData();
  const usCities = allCities.filter((city: CityData) => city.country === 'US');
  const statesCities: StatesCities = {};

  // Initialize all states
  Object.entries(stateMapping).forEach(([code, name]) => {
    statesCities[code] = {
      name,
      cities: []
    };
  });

  // Group cities by state
  usCities.forEach((city: CityData) => {
    const stateCode = city.admin1;
    if (stateCode && statesCities[stateCode]) {
      statesCities[stateCode].cities.push(city.name);
    }
  });

  // Sort cities alphabetically for each state and remove duplicates
  Object.keys(statesCities).forEach(stateCode => {
    statesCities[stateCode].cities = [...new Set(statesCities[stateCode].cities)].sort();
  });

  return statesCities;
};

export const useStatesCities = () => {
  return useQuery<StatesCities>({
    queryKey: ['statesCities'],
    queryFn: processUSCitiesData,
    staleTime: Infinity, // Data doesn't change during app session
  });
};

// Hook for getting cities by specific state
export const useCitiesByState = (stateCode: string | null) => {
  return useQuery({
    queryKey: ['cities', stateCode],
    queryFn: async () => {
      if (!stateCode) return [];

      const allCities = await getCitiesData();
      const usCities = allCities.filter((city: CityData) =>
        city.country === 'US' && city.admin1 === stateCode
      );

      const cityNames = usCities.map((city: CityData) => city.name);
      return [...new Set(cityNames)].sort(); // Remove duplicates and sort
    },
    enabled: !!stateCode,
    staleTime: Infinity, // Data doesn't change during app session
  });
};
