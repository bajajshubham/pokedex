export interface PokemonData {
  name: string;
  url: string;
}

export interface PaginatedResponse {
  data: PokemonData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
}

export interface EvolutionTrigger {
  id: number;
  name: string;
  names: Array<{
    language: {
      name: string;
      url: string;
    };
    name: string;
  }>;
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
}

export interface EvolutionTriggersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonTableProps {
  data: PokemonData[];
  totalCount: number;
  onSearch: (query: string) => void;
  onRowClick: (name: string) => void;
  searchQuery: string;
  isLoading?: boolean;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  isLoading?: boolean;
}

export interface PokemonModalProps {
  pokemonName: string;
  onClose: () => void;
}

export interface HomeProps {
  initialData: PokemonData[];
  totalCount: number;
  initialSearch: string;
}
