import { PokemonListResponse, PokemonDetails, EvolutionTriggersResponse, EvolutionTrigger } from '@/types/types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemonPage(limit: number, offset: number): Promise<PokemonListResponse> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon page: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchPokemonByName(name: string): Promise<PokemonDetails> {
  const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon ${name}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchEvolutionTriggers(limit: number, offset: number): Promise<EvolutionTriggersResponse> {
  const response = await fetch(`${BASE_URL}/evolution-trigger?limit=${limit}&offset=${offset}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch evolution triggers: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchEvolutionTriggerDetails(name: string): Promise<EvolutionTrigger> {
  const response = await fetch(`${BASE_URL}/evolution-trigger/${name.toLowerCase()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch evolution trigger ${name}: ${response.statusText}`);
  }
  
  return response.json();
}
