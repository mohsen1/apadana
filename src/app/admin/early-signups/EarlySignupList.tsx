'use client';

import { EarlyAccessSignup } from '@prisma/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useMemo } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getEarlySignups } from './actions';

export function EarlySignupList({
  earlySignups: initialSignups,
  pagination,
}: {
  earlySignups: EarlyAccessSignup[];
  pagination: {
    total: number;
    pages: number;
    take: number;
    skip: number;
  };
}) {
  const { execute: executeGetSignups, result: signupsResult } = useAction(getEarlySignups);

  const earlySignups = useMemo(() => {
    return signupsResult?.data?.earlySignups ?? initialSignups;
  }, [signupsResult, initialSignups]);

  return (
    <div className='space-y-4'>
      {earlySignups.length === 0 ? (
        <EmptyState>No early signups found</EmptyState>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Signed Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earlySignups.map((signup) => (
                <TableRow key={signup.id}>
                  <TableCell>{signup.email}</TableCell>
                  <TableCell>{new Date(signup.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex items-center justify-end space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                executeGetSignups({
                  skip: Math.max(0, pagination.skip - pagination.take),
                  take: pagination.take,
                })
              }
              disabled={pagination.skip === 0}
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                executeGetSignups({
                  skip: pagination.skip + pagination.take,
                  take: pagination.take,
                })
              }
              disabled={pagination.skip + pagination.take >= pagination.total}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
