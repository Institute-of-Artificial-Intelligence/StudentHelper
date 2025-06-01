
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, School, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';

const profileSchema = z.object({
  user_type: z.enum(['Абитуриент', 'Родитель'], {
    required_error: 'Пожалуйста выберите кем вы являетесь',
  }),
  phone: z.string()
    .min(5, 'Введите корректный номер телефона')
    .refine((val) => /^[+]?[0-9\s()-]+$/.test(val), {
      message: "Введите корректный номер телефона"
    }),
  school: z.string().min(3, 'Введите название школы и город'),
  referral_source: z.string().min(2, 'Укажите, откуда вы узнали о нас'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onBack, isLoading }) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      user_type: undefined,
      phone: '',
      school: '',
      referral_source: '',
    },
  });

  const handleFormSubmit = (data: ProfileFormValues) => {
    console.log('Profile form submitted with data:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="user_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Кем Вы являетесь?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Абитуриент" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Абитуриент
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Родитель" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Родитель
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваш номер телефона</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="+7 (999) 999-99-99" 
                    type="tel"
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Введите город и школу</FormLabel>
              <FormControl>
                <div className="relative">
                  <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Москва, Школа №123" 
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referral_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Откуда узнали о нас?</FormLabel>
              <FormControl>
                <div className="relative">
                  <HelpCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea 
                    placeholder="Напишите, откуда вы узнали о нас" 
                    className="min-h-[80px] resize-none pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button 
            type="button" 
            variant="outline"
            className="sm:w-1/2"
            onClick={onBack}
          >
            Назад
          </Button>
          <Button 
            type="submit" 
            className="sm:w-1/2" 
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
