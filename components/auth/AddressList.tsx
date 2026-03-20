'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserAuth } from '@/hooks';
import { useToast } from '@/hooks';
import { Address } from '@/lib/user-auth/types';
import { AddressForm } from './AddressForm';

export function AddressList() {
  const { user, refreshUser } = useUserAuth();
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshUser();
        toast({
          title: 'Success',
          description: 'Address deleted successfully',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete address',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
      });
    }
  };

  const addresses: Address[] = user?.addresses || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Shipping Addresses</h2>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => setEditingAddress({} as Address)}>
          Add New Address
        </Button>
      </div>

      {editingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress.id ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              address={editingAddress.id ? editingAddress : undefined}
              onSuccess={() => setEditingAddress(null)}
              onCancel={() => setEditingAddress(null)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No addresses saved yet. Add your first address to get started.
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{address.name}</h3>
                      {address.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm">
                      {address.address}<br />
                      {address.city}, {address.state} {address.zip_code}<br />
                      {address.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAddress(address)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}