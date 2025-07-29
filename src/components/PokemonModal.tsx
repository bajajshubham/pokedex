import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import { fetchPokemonByName, fetchEvolutionTriggers } from '@/utils/api';
import { PokemonModalProps, PokemonDetails, EvolutionTriggersResponse } from '@/types/types';

interface EvolutionTriggerData {
  name: string;
  url: string;
}

const columnHelper = createColumnHelper<EvolutionTriggerData>();

export default function PokemonModal({ pokemonName, onClose }: PokemonModalProps) {
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [evolutionTriggers, setEvolutionTriggers] = useState<EvolutionTriggerData[]>([]);
  const [triggerOffset, setTriggerOffset] = useState(0);
  const [triggerTotalCount, setTriggerTotalCount] = useState(0);
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(true);
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const triggerPageSize = 5;

  // Fetch Pokemon details
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setIsLoadingPokemon(true);
        setError(null);
        const pokemonData = await fetchPokemonByName(pokemonName);
        setPokemon(pokemonData);
      } catch (err) {
        setError(`Failed to load ${pokemonName}. Please try again.`);
        console.error('Error fetching Pokemon:', err);
      } finally {
        setIsLoadingPokemon(false);
      }
    };

    loadPokemon();
  }, [pokemonName]);

  // Fetch evolution triggers
  useEffect(() => {
    const loadEvolutionTriggers = async () => {
      try {
        setIsLoadingTriggers(true);
        const triggersData = await fetchEvolutionTriggers(triggerPageSize, triggerOffset);
        setEvolutionTriggers(triggersData.results);
        setTriggerTotalCount(triggersData.count);
      } catch (err) {
        console.error('Error fetching evolution triggers:', err);
      } finally {
        setIsLoadingTriggers(false);
      }
    };

    loadEvolutionTriggers();
  }, [triggerOffset]);

  const triggerColumns = useMemo<ColumnDef<EvolutionTriggerData>[]>(() => [
    columnHelper.accessor('name', {
      header: 'Evolution Trigger',
      cell: (info) => (
        <div className="font-medium text-gray-900 capitalize">
          {info.getValue().replace('-', ' ')}
        </div>
      ),
    }) as ColumnDef<EvolutionTriggerData>,
    columnHelper.display({
      id: 'id',
      header: 'Trigger ID',
      cell: (info) => {
        const url = info.row.original.url;
        const id = url.split('/').filter(Boolean).pop();
        return (
          <div className="text-sm text-gray-500">
            #{id}
          </div>
        );
      },
    }),
  ], []);

  const triggerTable = useReactTable({
    data: evolutionTriggers,
    columns: triggerColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(triggerTotalCount / triggerPageSize),
  });

  const handleTriggerPageChange = (offset: number) => {
    setTriggerOffset(offset);
  };

  const currentTriggerPage = Math.floor(triggerOffset / triggerPageSize) + 1;
  const totalTriggerPages = Math.ceil(triggerTotalCount / triggerPageSize);
  const hasNextTriggerPage = triggerOffset + triggerPageSize < triggerTotalCount;
  const hasPrevTriggerPage = triggerOffset > 0;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {isLoadingPokemon ? 'Loading...' : pokemon?.name || pokemonName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoadingPokemon ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : pokemon ? (
            <div className="p-6 space-y-6">
              {/* Pokemon Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image and Basic Info */}
                <div className="text-center">
                  {pokemon.sprites.other['official-artwork'].front_default ? (
                    <img
                      src={pokemon.sprites.other['official-artwork'].front_default}
                      alt={pokemon.name}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : pokemon.sprites.front_default ? (
                    <img
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-lg font-medium">#{pokemon.id.toString().padStart(3, '0')}</p>
                    <div className="flex justify-center gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type.type.name}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize"
                        >
                          {type.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Stats</h3>
                  <div className="space-y-3">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {stat.stat.name.replace('-', ' ')}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="text-lg font-bold">{(pokemon.height / 10).toFixed(1)}m</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="text-lg font-bold">{(pokemon.weight / 10).toFixed(1)}kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution Triggers Table */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Evolution Triggers</h3>
                
                {isLoadingTriggers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Evolution Triggers Table */}
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          {triggerTable.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                <th
                                  key={header.id}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {triggerTable.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.getVisibleCells().map(cell => (
                                <td
                                  key={cell.id}
                                  className="px-6 py-4 whitespace-nowrap text-sm"
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Evolution Triggers Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handleTriggerPageChange(triggerOffset - triggerPageSize)}
                          disabled={!hasPrevTriggerPage}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handleTriggerPageChange(triggerOffset + triggerPageSize)}
                          disabled={!hasNextTriggerPage}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Page <span className="font-medium">{currentTriggerPage}</span> of{' '}
                            <span className="font-medium">{totalTriggerPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() => handleTriggerPageChange(triggerOffset - triggerPageSize)}
                              disabled={!hasPrevTriggerPage}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => handleTriggerPageChange(triggerOffset + triggerPageSize)}
                              disabled={!hasNextTriggerPage}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
