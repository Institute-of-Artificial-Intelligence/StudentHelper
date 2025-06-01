import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email')
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    resetPassword,
    loading
  } = useAuth();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const success = await resetPassword(data.email);
    if (success) {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };
  return <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Восстановление пароля</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Введите свой email для получения инструкций по восстановлению пароля
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="example@mail.ru" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Отправка...' : 'Восстановить пароль'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <p>
            Вспомнили пароль?{' '}
            <Link to="/login" className="text-sm font-bold text-edu-primary hover:text-edu-secondary underline decoration-2 transition-colors">
              Вернуться к входу
            </Link>
          </p>
        </div>
      </div>
    </div>;
};
export default ForgotPassword;