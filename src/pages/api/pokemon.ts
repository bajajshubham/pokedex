import { NextApiRequest, NextApiResponse } from 'next';
import { fetchPokemonPage, PokemonListResponse } from '@/utils/api';
import { PokemonData } from '@/types/types';

interface ApiResponse {
  data: PokemonData[];
  meta: {
    totalRowCount: number;
  };
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
    let filteredResults: PokemonData[] = [];
    let totalCount = 0;
    
    if (searchQuery) {
      // For search, we need to fetch all Pokemon first
      const allPokemon = await fetchPokemonPage(2000, 0);
      
      filteredResults = allPokemon.results.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchQuery)
      );
      totalCount = filteredResults.length;
    } else {
      // No search, fetch all for pagination
      const allPokemon = await fetchPokemonPage(2000, 0);
      filteredResults = allPokemon.results;
      totalCount = allPokemon.count;
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
    res.status(500).json({ message: 'Failed to fetch Pokemon data' });
  }
}
