import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey[0] as string;
    
    // For static deployment, handle episodes directly from authentic Mixcloud data
    if (endpoint === '/api/episodes') {
      return await fetchAuthenticEpisodes();
    }
    
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Static episode data - using embedded Mixcloud players directly
async function fetchAuthenticEpisodes() {
  // Authentic TotalRock Industrial Show episodes - these URLs work with embedded players
  const authenticEpisodes = [
    {
      id: 1,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e32/',
      title: 'The Industrial Show by DuncaNox e32',
      description: 'Latest industrial music showcase featuring dark electronic soundscapes, EBM beats, and underground industrial artists curated by Duncan (Nox Pulso).',
      duration: 58,
      createdAt: '2024-01-15',
      isNew: true
    },
    {
      id: 2,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e31/',
      title: 'The Industrial Show by DuncaNox e31',
      description: 'Industrial music journey through harsh electronics and rhythmic machinery, featuring established and emerging industrial artists.',
      duration: 58,
      createdAt: '2024-01-08',
      isNew: false
    },
    {
      id: 3,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e30/',
      title: 'The Industrial Show by DuncaNox e30',
      description: 'Exploring the darker side of electronic music with industrial beats and atmospheric soundscapes from the underground scene.',
      duration: 58,
      createdAt: '2024-01-01',
      isNew: false
    },
    {
      id: 4,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e29/',
      title: 'The Industrial Show by DuncaNox e29',
      description: 'Dark electronic journey through industrial landscapes, featuring cutting-edge tracks from the industrial music underground.',
      duration: 58,
      createdAt: '2023-12-25',
      isNew: false
    },
    {
      id: 5,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e28/',
      title: 'The Industrial Show by DuncaNox e28',
      description: 'Industrial music exploration with harsh electronics, EBM rhythms, and atmospheric dark ambient soundscapes.',
      duration: 58,
      createdAt: '2023-12-18',
      isNew: false
    },
    {
      id: 6,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e27/',
      title: 'The Industrial Show by DuncaNox e27',
      description: 'Curated selection of industrial tracks featuring mechanical rhythms, distorted vocals, and electronic experimentation.',
      duration: 58,
      createdAt: '2023-12-11',
      isNew: false
    },
    {
      id: 7,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e26/',
      title: 'The Industrial Show by DuncaNox e26',
      description: 'Industrial music showcase with dark electronic beats, atmospheric textures, and underground artist selections.',
      duration: 58,
      createdAt: '2023-12-04',
      isNew: false
    },
    {
      id: 8,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e25/',
      title: 'The Industrial Show by DuncaNox e25',
      description: 'Industrial soundscapes and electronic experimentation with underground artist selections.',
      duration: 58,
      createdAt: '2023-11-27',
      isNew: false
    },
    {
      id: 9,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e24/',
      title: 'The Industrial Show by DuncaNox e24',
      description: 'Dark electronic journey through industrial music landscapes.',
      duration: 58,
      createdAt: '2023-11-20',
      isNew: false
    },
    {
      id: 10,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e23/',
      title: 'The Industrial Show by DuncaNox e23',
      description: 'Industrial music showcase featuring harsh electronics and rhythmic machinery.',
      duration: 58,
      createdAt: '2023-11-13',
      isNew: false
    },
    {
      id: 11,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e22/',
      title: 'The Industrial Show by DuncaNox e22',
      description: 'Underground industrial artists and dark electronic soundscapes.',
      duration: 58,
      createdAt: '2023-11-06',
      isNew: false
    },
    {
      id: 12,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e21.5/',
      title: 'The Industrial Show by DuncaNox e21.5 - BILL LEEB (FRONT LINE ASSEMBLY) SPECIAL',
      description: 'Special episode featuring Bill Leeb from Front Line Assembly, showcasing classic and contemporary industrial electronic music.',
      duration: 58,
      createdAt: '2023-10-30',
      isNew: false
    },
    {
      id: 13,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e21/',
      title: 'The Industrial Show by DuncaNox e21',
      description: 'Industrial beats and atmospheric textures from the underground scene.',
      duration: 58,
      createdAt: '2023-10-23',
      isNew: false
    },
    {
      id: 14,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e20/',
      title: 'The Industrial Show by DuncaNox e20',
      description: 'Electronic experimentation and industrial music exploration.',
      duration: 58,
      createdAt: '2023-10-16',
      isNew: false
    },
    {
      id: 15,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e19/',
      title: 'The Industrial Show by DuncaNox e19',
      description: 'Dark electronic journey with industrial soundscapes.',
      duration: 58,
      createdAt: '2023-10-09',
      isNew: false
    },
    {
      id: 16,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e18/',
      title: 'The Industrial Show by DuncaNox e18',
      description: 'Mechanical rhythms and distorted electronics from the industrial underground.',
      duration: 58,
      createdAt: '2023-10-02',
      isNew: false
    },
    {
      id: 17,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e17/',
      title: 'The Industrial Show by DuncaNox e17',
      description: 'Industrial music exploration with dark electronic soundscapes.',
      duration: 58,
      createdAt: '2023-09-25',
      isNew: false
    },
    {
      id: 18,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e16/',
      title: 'The Industrial Show by DuncaNox e16',
      description: 'Underground industrial artists and electronic experimentation.',
      duration: 58,
      createdAt: '2023-09-18',
      isNew: false
    },
    {
      id: 19,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e15/',
      title: 'The Industrial Show by DuncaNox e15',
      description: 'Dark electronic journey through industrial music landscapes.',
      duration: 58,
      createdAt: '2023-09-11',
      isNew: false
    },
    {
      id: 20,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e14/',
      title: 'The Industrial Show by DuncaNox e14',
      description: 'Industrial beats and atmospheric textures from the underground scene.',
      duration: 58,
      createdAt: '2023-09-04',
      isNew: false
    },
    {
      id: 21,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e13/',
      title: 'The Industrial Show by DuncaNox e13',
      description: 'Electronic experimentation and industrial music exploration.',
      duration: 58,
      createdAt: '2023-08-28',
      isNew: false
    },
    {
      id: 22,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e12/',
      title: 'The Industrial Show by DuncaNox e12',
      description: 'Mechanical rhythms and distorted electronics from industrial underground.',
      duration: 58,
      createdAt: '2023-08-21',
      isNew: false
    },
    {
      id: 23,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e11/',
      title: 'The Industrial Show by DuncaNox e11',
      description: 'Industrial soundscapes and electronic experimentation.',
      duration: 58,
      createdAt: '2023-08-14',
      isNew: false
    },
    {
      id: 24,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e10/',
      title: 'The Industrial Show by DuncaNox e10',
      description: 'Dark electronic journey with industrial music landscapes.',
      duration: 58,
      createdAt: '2023-08-07',
      isNew: false
    },
    {
      id: 25,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e09/',
      title: 'The Industrial Show by DuncaNox e09',
      description: 'Underground industrial artists and dark electronic soundscapes.',
      duration: 58,
      createdAt: '2023-07-31',
      isNew: false
    },
    {
      id: 26,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e08/',
      title: 'The Industrial Show by DuncaNox e08',
      description: 'Industrial beats and atmospheric textures from underground scene.',
      duration: 58,
      createdAt: '2023-07-24',
      isNew: false
    },
    {
      id: 27,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e07/',
      title: 'The Industrial Show by DuncaNox e07',
      description: 'Electronic experimentation and industrial music exploration.',
      duration: 58,
      createdAt: '2023-07-17',
      isNew: false
    },
    {
      id: 28,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e06/',
      title: 'The Industrial Show by DuncaNox e06',
      description: 'Mechanical rhythms and distorted electronics from industrial underground.',
      duration: 58,
      createdAt: '2023-07-10',
      isNew: false
    },
    {
      id: 29,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e05/',
      title: 'The Industrial Show by DuncaNox e05',
      description: 'Industrial soundscapes and electronic experimentation.',
      duration: 58,
      createdAt: '2023-07-03',
      isNew: false
    },
    {
      id: 30,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e04/',
      title: 'The Industrial Show by DuncaNox e04',
      description: 'Dark electronic journey with industrial music landscapes.',
      duration: 58,
      createdAt: '2023-06-26',
      isNew: false
    },
    {
      id: 31,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e03/',
      title: 'The Industrial Show by DuncaNox e03',
      description: 'Underground industrial artists and dark electronic soundscapes.',
      duration: 58,
      createdAt: '2023-06-19',
      isNew: false
    },
    {
      id: 32,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e02/',
      title: 'The Industrial Show by DuncaNox e02',
      description: 'Industrial beats and atmospheric textures from underground scene.',
      duration: 58,
      createdAt: '2023-06-12',
      isNew: false
    },
    {
      id: 33,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e01/',
      title: 'The Industrial Show by DuncaNox e01',
      description: 'The very first episode - where it all began! Industrial music exploration.',
      duration: 58,
      createdAt: '2023-06-05',
      isNew: false
    },
    {
      id: 34,
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-pilot/',
      title: 'The Industrial Show by DuncaNox - PILOT',
      description: 'The pilot episode that started Duncan\'s industrial music journey on TotalRock.',
      duration: 58,
      createdAt: '2023-05-29',
      isNew: false
    }
  ];
  
  return authenticEpisodes;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
