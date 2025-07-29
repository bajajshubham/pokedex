import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { PokemonData, PokemonTableProps } from '@/types/types';
import SearchBar from './SearchBar';

const columnHelper = createColumnHelper<PokemonData>();

export default function PokemonTable({
  data,
  totalCount,
  onSearch,
  onRowClick,
  searchQuery,
  isLoading = false
}: PokemonTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [globalFilter, setGlobalFilter] = useState(searchQuery);

  const columns = useMemo<ColumnDef<PokemonData>[]>(() => [
    columnHelper.display({
      id: 'id',
      header: 'ID',
      cell: (info) => {
        const url = info.row.original.url;
        const id = url.split('/').filter(Boolean).pop();
        return (
          <div className="text-sm text-gray-500 font-mono">
            #{id?.padStart(3, '0')}
          </div>
        );
      },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 capitalize">
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(info.row.original.name);
          }}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Details
        </button>
      ),
    }),
  ], [onRowClick, isLoading]);

  const table = useReactTable({
    data,
    columns,
    rowCount: totalCount,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      onSearch(value);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const handleSearch = (query: string) => {
    table.setGlobalFilter(query);
    table.setPageIndex(0); // Reset to first page when searching
    onSearch(query); // Call parent component's search handler
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        initialValue={searchQuery}
        isLoading={isLoading}
      />

      {/* Results count */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {globalFilter?.trim() ? `Search results for "${globalFilter}"` : 'All Pokémon'}
        </span>
        <span>
          {totalCount} total result{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {isLoading ? 'Loading...' : globalFilter?.trim() ? 'No Pokémon found matching your search.' : 'No Pokémon available.'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => !isLoading && onRowClick(row.original.name)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TanStack Built-in Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              {'<<'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              {'<'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
            >
              {'>'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage() || isLoading}
            >
              {'>>'}
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Go to page:</span>
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              className="border p-1 rounded w-16 text-center"
              disabled={isLoading}
            />
          </div>

          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            disabled={isLoading}
            className="border rounded p-1"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
