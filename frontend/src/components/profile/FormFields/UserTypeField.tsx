
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { ProfileFormValues } from '../ProfileFormTypes';

interface UserTypeFieldProps {
  control: Control<ProfileFormValues>;
}

export const UserTypeField: React.FC<UserTypeFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="user_type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Кем Вы являетесь?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
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
  );
};
