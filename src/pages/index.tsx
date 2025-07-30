import { useState, useCallback, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PokemonTable from '@/components/PokemonTable';
import PokemonModal from '@/components/PokemonModal';
import { fetchPokemonPage } from '@/utils/api';
import { PokemonData, HomeProps } from '@/types/types';

export default function Home({ initialData, totalCount, initialSearch }: HomeProps) {
  const [pokemonData, setPokemonData] = useState<PokemonData[]>(initialData);
  const [totalRowCount, setTotalRowCount] = useState(totalCount);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  // Update data when search query or pagination changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const start = pagination.pageIndex * pagination.pageSize;
          const params = new URLSearchParams({
            start: start.toString(),
            size: pagination.pageSize.toString()
          });

          // Only add globalFilter if searchQuery is not empty
          if (searchQuery.trim()) {
            params.append('globalFilter', searchQuery);
          }

          const url = `/api/pokemon?${params.toString()}`;
          console.log('Fetching data from:', url);

          const response = await fetch(url);
          console.log('Response status:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Received data:', { dataLength: data.data?.length, totalCount: data.meta?.totalRowCount });

          setPokemonData(data.data || []);
          setTotalRowCount(data.meta?.totalRowCount || 0);

          // Update URL
          const urlObj = new URL(window.location.href);
          if (searchQuery.trim()) {
            urlObj.searchParams.set('search', searchQuery);
          } else {
            urlObj.searchParams.delete('search');
          }
          window.history.pushState({}, '', urlObj);
        } catch (error) {
          console.error('Error fetching Pokemon:', error);
          // Set empty data on error to prevent infinite loading
          setPokemonData([]);
          setTotalRowCount(0);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, pagination]);

  const handleSearch = useCallback((search: string) => {
    setSearchQuery(search);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handlePaginationChange = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);

  const handleRowClick = useCallback((name: string) => {
    setSelectedPokemon(name);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPokemon(null);
  }, []);

  return (
    <>
      <Head>
        <title>Pokédex</title>
        <meta name="description" content="Browse and explore Pokémon with detailed information" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Pokédex: The Pokémon Encyclopedia</h1>
            <p className="text-gray-600">
              Explore the world of Pokémon with detailed information and statistics
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PokemonTable
              data={pokemonData}
              totalCount={totalRowCount}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              onRowClick={handleRowClick}
              onPaginationChange={handlePaginationChange}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {selectedPokemon && (
          <PokemonModal
            pokemonName={selectedPokemon}
            onClose={handleCloseModal}
          />
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
  const search = ((query.search as string) || '').trim();

  try {
    // Call the API logic directly instead of making HTTP request
    let filteredResults: PokemonData[] = [];
    let totalCount = 0;

    if (search) {
      // For search, we need to fetch all Pokemon first
      const allPokemon = await fetchPokemonPage(2000, 0);

      filteredResults = allPokemon.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
      totalCount = filteredResults.length;
    } else {
      // No search, fetch all for pagination
      const allPokemon = await fetchPokemonPage(2000, 0);
      filteredResults = allPokemon.results;
      totalCount = allPokemon.count;
    }

    // Get first 20 items for initial load
    const initialData = filteredResults.slice(0, 20);

    return {
      props: {
        initialData,
        totalCount,
        initialSearch: search
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);

    // Return empty data on error
    return {
      props: {
        initialData: [],
        totalCount: 0,
        initialSearch: ''
      }
    };
  }
};
