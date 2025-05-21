// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || ''); // Email display, not editable for now
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/profile');
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
    }
  }, [user, authLoading, router]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateUserProfile({ name });
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update your name.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New passwords do not match.",
      });
      return;
    }
    if (newPassword.length < 6) {
         toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      // In a real app, you'd call an API to change the password.
      // Here, it's a mock. We'll just show a success message.
      // The updateUserProfile in AuthContext doesn't actually handle password changes.
      console.log("Mock password change for user:", user.email, "New password:", newPassword);
      toast({
        title: "Password Changed (Mock)",
        description: "Your password has been 'changed'. In a real app, this would be secure!",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not change your password.",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <UserCog className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your account details.</p>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and view your email.</CardDescription>
        </CardHeader>
        <form onSubmit={handleNameUpdate}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-display">Email</Label>
              <Input id="email-display" type="email" value={email} disabled className="text-base bg-muted/50" />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating && name === user?.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Name
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Choose a new password for your account. (Mock functionality)</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordChange}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="text-base"
              />
               <p className="text-xs text-muted-foreground">
                Note: For this prototype, current password is not validated.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
             {isUpdating && (newPassword || currentPassword) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
