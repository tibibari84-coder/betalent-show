'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, CreatorProfile } from '@prisma/client';

import { POSTHOG_EVENTS } from '@/lib/analytics/events';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type FeedbackState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

interface ProfileFormProps {
  user: User;
  creatorProfile: CreatorProfile | null;
}

export function ProfileForm({ user, creatorProfile }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [avatarUploadKey, setAvatarUploadKey] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

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

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarUploading(true);
    setFeedback(null);

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

      const data = (await response.json()) as {
        error?: string;
        uploadUrl?: string;
        assetUrl?: string;
        key?: string;
      };

      if (!response.ok || !data.uploadUrl || !data.assetUrl || !data.key) {
        throw new Error(data.error || 'Unable to create avatar upload URL.');
      }

      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
      if (posthogKey && typeof window !== 'undefined') {
        const posthogModule = await import('posthog-js');
        const posthog = posthogModule.default;

        if (!posthog.__loaded) {
          posthog.init(posthogKey, {
            api_host: posthogHost || 'https://us.i.posthog.com',
            capture_pageview: false,
            persistence: 'memory',
          });
        }

        posthog.capture(POSTHOG_EVENTS.creator_profile_avatar_upload_requested, {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        });
      }

      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Avatar upload failed.');
      }

      setAvatarUrl(data.assetUrl);
      setAvatarUploadKey(data.key);
      setFeedback({
        type: 'success',
        message: 'Avatar uploaded. Save the profile to make it official.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Avatar upload failed.',
      });
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          username: data.username,
          city: data.city,
          country: data.country,
          avatarUrl: avatarUrl || null,
          avatarUploadKey,
          bio: data.bio,
          website: data.website,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        fieldErrors?: {
          username?: string;
        };
      };

      if (!response.ok) {
        if (payload.fieldErrors?.username || response.status === 409) {
          throw new Error(payload.fieldErrors?.username || 'That username is already taken.');
        }
        throw new Error(payload.error || 'Unable to update your profile.');
      }

      setAvatarUploadKey(null);
      setFeedback({
        type: 'success',
        message: 'Profile saved successfully.',
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-busy={isLoading || avatarUploading}>
      {feedback ? (
        <p
          className={
            feedback.type === 'success'
              ? 'rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
              : 'rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200'
          }
        >
          {feedback.message}
        </p>
      ) : null}

      {(isLoading || avatarUploading) ? (
        <div className="foundation-loading-skeleton h-2 rounded-full" aria-hidden />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Display Name" error={errors.displayName?.message}>
          <Input {...register('displayName')} className="foundation-form-input h-12 px-4" />
        </FormField>

        <FormField label="Username" error={errors.username?.message}>
          <Input {...register('username')} className="foundation-form-input h-12 px-4" />
        </FormField>

        <FormField label="City" error={errors.city?.message}>
          <Input {...register('city')} className="foundation-form-input h-12 px-4" />
        </FormField>

        <FormField label="Country" error={errors.country?.message}>
          <Input {...register('country')} className="foundation-form-input h-12 px-4" />
        </FormField>
      </div>

      <FormField label="Avatar">
        <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs uppercase tracking-[0.18em] text-white/42">No avatar</span>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-white/76 file:mr-4 file:rounded-full file:border file:border-white/10 file:bg-white/[0.08] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/[0.12]"
              />
              {avatarUploading ? (
                <p className="text-xs text-white/58">Uploading avatar…</p>
              ) : (
                <p className="text-xs text-white/44">Square image recommended.</p>
              )}
            </div>
          </div>
        </div>
      </FormField>

      <FormField label="Bio" error={errors.bio?.message}>
        <Textarea {...register('bio')} rows={4} className="foundation-form-input min-h-28 px-4 py-3" />
      </FormField>

      <FormField label="Website" error={errors.website?.message}>
        <Input {...register('website')} type="url" className="foundation-form-input h-12 px-4" />
      </FormField>

      <Button
        type="submit"
        disabled={isLoading || avatarUploading}
        className="foundation-primary-button h-11 px-5 text-sm font-semibold tracking-[0.08em] uppercase"
      >
        {isLoading ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
