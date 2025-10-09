'use client';

import { EditEventDialog } from '@/components/edit-event-dialog';
import { RatingDialog } from '@/components/rating-dialog';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import { Event } from '@/types/events';
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, Star, Users } from 'lucide-react';
import { useState } from 'react';

type Props = {
  events: Event[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export const EventsTable = ({ events, currentUserId, isAdmin }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'restaurant',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Restaurant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.restaurant}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <Calendar className="mr-2 h-4 w-4" />
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            {new Date(row.original.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      accessorKey: 'averageRating',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <Star className="mr-2 h-4 w-4" />
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { averageRating, totalRatings } = row.original;

        if (!totalRatings || totalRatings === 0) {
          return <Badge variant="secondary">No ratings yet</Badge>;
        }

        return (
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {averageRating?.toFixed(1)} ({totalRatings})
            </Badge>
          </div>
        );
      },
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      accessorKey: 'totalRatings',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <Users className="mr-2 h-4 w-4" />
            Participants
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { totalRatings } = row.original;
        return <div className="text-center">{totalRatings || 0}</div>;
      },
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const event = row.original;
        const userRating = currentUserId ? event.ratings?.find((r) => r.userId === currentUserId) || undefined : undefined;

        return (
          <div className="flex items-center justify-end gap-2">
            {currentUserId && <RatingDialog event={event} currentUserId={currentUserId} existingRating={userRating} />}
            {isAdmin && <EditEventDialog event={event} />}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return <Table table={table} columns={columns} />;
};
