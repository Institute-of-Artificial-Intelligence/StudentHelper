
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Profile } from '@/types/auth';
import { UserTypeField } from './FormFields/UserTypeField';
import { ContactInfoFields } from './FormFields/ContactInfoFields';
import { profileSchema, ProfileFormValues } from './ProfileFormTypes';

interface ProfileFormProps {
  profile: Profile | null;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit, isLoading }) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      user_type: profile?.user_type as any || undefined,
      phone: profile?.phone || '',
      school: profile?.school || '',
      referral_source: profile?.referral_source || '',
    },
  });
  
  // useEffect для обновления формы при изменении props
  React.useEffect(() => {
    if (profile) {
      form.reset({
        user_type: profile.user_type as any || undefined,
        phone: profile.phone || '',
        school: profile.school || '',
        referral_source: profile.referral_source || '',
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: ProfileFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <UserTypeField control={form.control} />
        <ContactInfoFields control={form.control} />
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
