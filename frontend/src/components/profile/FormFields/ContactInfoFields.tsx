
import React from 'react';
import { Phone, School, Info } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { ProfileFormValues } from '../ProfileFormTypes';

interface ContactInfoFieldsProps {
  control: Control<ProfileFormValues>;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ваш номер телефона</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="+7 (999) 123-45-67" 
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
        control={control}
        name="school"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Город и школа</FormLabel>
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
        control={control}
        name="referral_source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Откуда узнали о нас</FormLabel>
            <FormControl>
              <div className="relative">
                <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
    </>
  );
};
