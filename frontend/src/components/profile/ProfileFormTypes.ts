
import { z } from 'zod';

export const profileSchema = z.object({
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
