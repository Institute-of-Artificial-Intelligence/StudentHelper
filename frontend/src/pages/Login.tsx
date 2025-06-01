import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов')
});
type LoginFormValues = z.infer<typeof loginSchema>;
const Login = () => {
  const navigate = useNavigate();
  const {
    signIn,
    loading
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const onSubmit = async (data: LoginFormValues) => {
    const success = await signIn(data.email, data.password);
    if (success) {
      navigate('/');
    }
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-edu-primary mb-4">
            Ваше будущее начинается здесь!
          </h1>
          
          <div className="bg-gradient-to-r from-edu-light to-white p-8 rounded-2xl shadow-lg border">
            <div className="space-y-4 text-lg">
              <p className="text-2xl font-semibold text-edu-primary">
                🌟 Добро пожаловать на postupi.site — ваш ключ к успешному поступлению в вуз! 🚀
              </p>
              
              <p className="text-gray-700">
                Мы — команда студентов, и мы создали этот сайт, чтобы сделать ваш путь в ВУЗ легким и увлекательным! Здесь - самая актуальную информация, и мы собрали ее с любовью и вниманием к деталям. 📚
              </p>
              
              <p className="text-xl font-semibold text-edu-secondary">
                Не упускайте свой шанс, регистрируйтесь сейчас и делайте первый шаг к своей мечте!
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto rounded-lg border bg-card p-6 shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Вход в систему</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Введите свои данные для входа
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

              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="••••••" className="pl-10 pr-10" type={showPassword ? 'text' : 'password'} {...field} />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-3 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Забыли пароль?
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>} />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm">
              Нет учетной записи?{' '}
              <Link to="/register" className="text-sm font-bold text-edu-primary hover:text-edu-secondary underline decoration-2 transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Login;