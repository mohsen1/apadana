'use client';

import { EmailAddress, Role, User, UserRole } from '@prisma/client';
import { ChevronLeft, ChevronRight, Loader2, Shield } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getUsers, updateUserRole } from '@/app/admin/actions';

export function UserList({
  users: initialUsers,
  pagination,
}: {
  users: (User & { password: never; roles: UserRole[]; emailAddresses: EmailAddress[] })[];
  pagination: {
    total: number;
    pages: number;
    take: number;
    skip: number;
  };
}) {
  const { toast } = useToast();
  const { execute: executeGetUsers, result: usersResult } = useAction(getUsers);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const { execute: executeUpdateUserRole, status: updateUserRoleStatus } = useAction(
    updateUserRole,
    {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User role has been updated successfully',
        });
        setOpenDialog(null);
        executeGetUsers({
          skip: pagination.skip,
          take: pagination.take,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update user role',
          variant: 'destructive',
        });
      },
    },
  );

  const users = useMemo(() => {
    return usersResult?.data?.users ?? initialUsers;
  }, [usersResult, initialUsers]);

  return (
    <div className='space-y-4'>
      {users.length === 0 ? (
        <EmptyState>No users found</EmptyState>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.emailAddresses.find((email) => email.isPrimary)?.emailAddress}
                  </TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    {user.roles
                      .map((role) => role.role)
                      .map((role) => (
                        <Badge key={role} variant={role === Role.ADMIN ? 'default' : 'secondary'}>
                          {role}
                        </Badge>
                      ))}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={openDialog === user.id}
                      onOpenChange={(open) => setOpenDialog(open ? user.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant='outline' size='sm'>
                          <Shield className='mr-2 h-4 w-4' />
                          {user.roles.some((role) => role.role === Role.ADMIN)
                            ? 'Remove Admin'
                            : 'Make Admin'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Role Change</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to{' '}
                            {user.roles.some((role) => role.role === Role.ADMIN)
                              ? 'remove admin privileges from'
                              : 'make'}{' '}
                            {user.firstName} {user.lastName}{' '}
                            {!user.roles.some((role) => role.role === Role.ADMIN) && 'an admin'}?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant='outline'
                            disabled={updateUserRoleStatus === 'executing'}
                            onClick={() =>
                              executeUpdateUserRole({
                                userId: user.id,
                                role: user.roles.some((role) => role.role === Role.ADMIN)
                                  ? Role.HOST
                                  : Role.ADMIN,
                              })
                            }
                          >
                            {updateUserRoleStatus === 'executing' ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Updating...
                              </>
                            ) : (
                              'Confirm'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            {...pagination}
            onPageChange={(skip, take) => {
              executeGetUsers({
                skip,
                take,
              });
            }}
          />
        </>
      )}
    </div>
  );
}
