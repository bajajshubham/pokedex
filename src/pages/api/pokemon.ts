import { NextApiRequest, NextApiResponse } from 'next';
import { fetchPokemonPage } from '@/utils/api';
import { PokemonData } from '@/types/types';

interface ApiResponse {
  data: PokemonData[];
  meta: {
    totalRowCount: number;
  };
}

// Simple in-memory cache
let pokemonCache: PokemonData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedPokemon(): Promise<PokemonData[]> {
  const now = Date.now();

  // Return cached data if it's still fresh
  if (pokemonCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached Pokemon data');
    return pokemonCache;
  }

  console.log('Fetching fresh Pokemon data from API');
  try {
    const allPokemon = await fetchPokemonPage(1500, 0);
    pokemonCache = allPokemon.results;
    cacheTimestamp = now;
    return pokemonCache;
  } catch (error) {
    console.error('Failed to fetch Pokemon data:', error);
    // If we have stale cache, use it
    if (pokemonCache) {
      console.log('Using stale cache due to API error');
      return pokemonCache;
    }
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { start = '0', size = '20', globalFilter = '' } = req.query;
  const startNum = parseInt(start as string);
  const sizeNum = Math.min(100, Math.max(1, parseInt(size as string)));
  const searchQuery = (globalFilter as string).toLowerCase().trim();

  try {
    // Get cached Pokemon data
    const allPokemon = await getCachedPokemon();

    let filteredResults: PokemonData[] = [];
    let totalCount = 0;

    if (searchQuery) {
      // Filter cached data by search query
      filteredResults = allPokemon.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchQuery)
      );
      totalCount = filteredResults.length;
    } else {
      // Use all cached data
      filteredResults = allPokemon;
      totalCount = allPokemon.length;
    }

    // Apply pagination
    const paginatedResults = filteredResults.slice(startNum, startNum + sizeNum);

    const response: ApiResponse = {
      data: paginatedResults,
      meta: {
        totalRowCount: totalCount,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      message: 'Failed to fetch Pokemon data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
