'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, CreatorProfile } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  creatorProfile: CreatorProfile | null;
}

export function ProfileForm({ user, creatorProfile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);

    try {
      const response = await fetch('/api/assets/r2-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          purpose: 'avatar',
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to create upload URL');
      }

      const data = await response.json();
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Avatar upload failed');
      }

      setAvatarUrl(data.assetUrl);
      alert('Avatar uploaded successfully. Save your profile to persist the change.');
    } catch (error) {
      console.error(error);
      alert('Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      username: user.username || '',
      city: user.city || '',
      country: user.country || '',
      bio: creatorProfile?.bio || '',
      website: creatorProfile?.website || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Update user profile
      const userResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          username: data.username,
          city: data.city,
          country: data.country,
          avatarUrl: avatarUrl || undefined,
        }),
      });

      // Update creator profile
      const creatorResponse = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: data.bio,
          website: data.website,
        }),
      });

      if (userResponse.ok && creatorResponse.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Display Name" error={errors.displayName?.message}>
          <Input {...register('displayName')} />
        </FormField>

        <FormField label="Username" error={errors.username?.message}>
          <Input {...register('username')} />
        </FormField>

        <FormField label="City" error={errors.city?.message}>
          <Input {...register('city')} />
        </FormField>

        <FormField label="Country" error={errors.country?.message}>
          <Input {...register('country')} />
        </FormField>
      </div>

      <FormField label="Avatar">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-900">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-gray-500">No avatar</span>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-600"
            />
            {avatarUploading && <p className="text-xs text-gray-400">Uploading avatar…</p>}
          </div>
        </div>
      </FormField>

      <FormField label="Bio" error={errors.bio?.message}>
        <Textarea {...register('bio')} rows={4} />
      </FormField>

      <FormField label="Website" error={errors.website?.message}>
        <Input {...register('website')} type="url" />
      </FormField>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}