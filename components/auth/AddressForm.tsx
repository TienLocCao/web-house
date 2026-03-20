'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserAuth } from '@/hooks';
import { useToast } from '@/hooks';
import { Address } from '@/lib/user-auth/types';

interface AddressFormProps {
  address?: Address;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const { user, refreshUser } = useUserAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: address?.name || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    state: address?.state || '',
    zip_code: address?.zip_code || '',
    country: address?.country || '',
    is_default: address?.is_default || false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = address ? '/api/user/addresses' : '/api/user/addresses';
      const method = address ? 'PUT' : 'POST';
      const body = address ? { id: address.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await refreshUser();
        toast({
          title: 'Success',
          description: address ? 'Address updated successfully' : 'Address added successfully',
        });
        onSuccess?.();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to save address',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Enter city"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            required
            placeholder="Enter state"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP Code</Label>
          <Input
            id="zip_code"
            name="zip_code"
            type="text"
            value={formData.zip_code}
            onChange={handleChange}
            required
            placeholder="Enter ZIP code"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={handleChange}
          required
          placeholder="Enter country"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) =>
            setFormData(prev => ({ ...prev, is_default: checked as boolean }))
          }
        />
        <Label htmlFor="is_default">Set as default address</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}