import type { ColumnDef } from '@tanstack/vue-table';
import type { ServerRow } from '@/types';

/**
 * TanStack columns are plain data — no JSX. We render cells by `cell.getValue()`
 * and dispatch on accessorKey at the template level.
 */
export const serverColumns: ColumnDef<ServerRow>[] = [
  {
    accessorKey: 't',
    header: 'Timestamp',
    enableSorting: true,
    size: 160,
  },
  {
    accessorKey: 'serverId',
    header: 'Server ID',
    enableSorting: true,
    size: 160,
  },
  {
    accessorKey: 'region',
    header: 'Region',
    enableSorting: true,
    size: 110,
  },
  {
    accessorKey: 'cpu',
    header: 'CPU',
    enableSorting: true,
    size: 110,
  },
  {
    accessorKey: 'memory',
    header: 'Memory',
    enableSorting: true,
    size: 110,
  },
  {
    accessorKey: 'traffic',
    header: 'Traffic',
    enableSorting: true,
    size: 120,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    size: 110,
  },
];
