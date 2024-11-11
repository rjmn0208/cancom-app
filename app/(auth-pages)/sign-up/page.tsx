'use client'

import { useState } from 'react';
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import Link from 'next/link';
import { signInAction, signUpAction } from '@/app/auth/auth-actions';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(
  (data) => {
    return data.password.length >= 6
  },
  {
    message: "Password Must Have 6 Characters",
    path: ["password"],
  }
).refine(
  (data) => {
    return data.password === data.confirmPassword
  },
  {
    message: "Password Mismatched",
    path: ["confirmPassword"],
  }
)

export default function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  })
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);

    signUpAction(formData)
  }


  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Enter email and password to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email:</FormLabel>
                    <FormControl>
                      <Input placeholder="example@domainname.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password:</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} type='password'/>
                    </FormControl>
                    <FormDescription>
                      Minimum of 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password:</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} type='password'/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='w-full mt-2' type='submit'>Sign Up</Button>
            </form>
          </Form>
          <div className="flex justify-center m-2">
            <p>Or</p>
          </div>
          <div className="flex justify-center mt-2">
            <GoogleSignInButton />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center m-2">
          <p>Already have an Account? <Link href='/sign-in' className='underline'>Sign In</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
