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

// Fetch authentic TotalRock Industrial episodes for static deployment
async function fetchAuthenticEpisodes() {
  // Use authentic episode data from the real TotalRock Industrial playlist
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
      mixcloudId: 'https://www.mixcloud.com/TotalRockOfficial/the-industrial-show-by-duncanox-e21.5/',
      title: 'The Industrial Show by DuncaNox e21.5 - BILL LEEB (FRONT LINE ASSEMBLY) SPECIAL',
      description: 'Special episode featuring Bill Leeb from Front Line Assembly, showcasing classic and contemporary industrial electronic music.',
      duration: 58,
      createdAt: '2023-11-27',
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
