import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { validateUserSession } from '@/lib/user-auth';
import { sql } from '@/lib/db/client';
import { Address } from '@/lib/user-auth/types';

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip_code: z.string().min(3),
  country: z.string().min(2),
  is_default: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await validateUserSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateUserSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const addressData = addressSchema.parse(body);

    const newAddress: Address = {
      id: nanoid(),
      ...addressData,
      is_default: addressData.is_default || false,
    };

    const currentAddresses: Address[] = user.addresses || [];

    // If this is the default address, unset others
    if (newAddress.is_default) {
      currentAddresses.forEach(addr => addr.is_default = false);
    }

    const updatedAddresses = [...currentAddresses, newAddress];

    await sql`UPDATE users SET addresses = ${JSON.stringify(updatedAddresses)}, updated_at = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({
      address: newAddress,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateUserSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...addressData } = body;
    const validatedData = addressSchema.parse(addressData);

    const currentAddresses: Address[] = user.addresses || [];
    const addressIndex = currentAddresses.findIndex(addr => addr.id === id);

    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const updatedAddress: Address = {
      id,
      ...validatedData,
      is_default: validatedData.is_default || false,
    };

    // If this is the default address, unset others
    if (updatedAddress.is_default) {
      currentAddresses.forEach(addr => addr.is_default = false);
    }

    currentAddresses[addressIndex] = updatedAddress;

    await sql`UPDATE users SET addresses = ${JSON.stringify(currentAddresses)}, updated_at = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({
      address: updatedAddress,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateUserSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const currentAddresses: Address[] = user.addresses || [];
    const filteredAddresses = currentAddresses.filter(addr => addr.id !== addressId);

    await sql`UPDATE users SET addresses = ${JSON.stringify(filteredAddresses)}, updated_at = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}