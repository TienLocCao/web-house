import { redirect } from 'next/navigation';
import { validateUserSession } from '@/lib/user-auth';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { AddressList } from '@/components/auth/AddressList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ProfilePage() {
  const user = await validateUserSession();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="password">
            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}