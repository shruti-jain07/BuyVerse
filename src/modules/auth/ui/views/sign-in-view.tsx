"use client";
import z from "zod";
import { Poppins } from "next/font/google";
import { toast } from "sonner";
import {zodResolver} from "@hookform/resolvers/zod";
import { loginSchema} from "../../schemas";
import {useForm} from "react-hook-form";
import{Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form";
import {useMutation, useQueryClient} from "@tanstack/react-query"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
const poppins=Poppins({
    subsets:["latin"],
    weight:["700"],
})
export const SignInView = () => {
  const router=useRouter();
  const trpc=useTRPC();
  const queryClient=useQueryClient()
  const login=useMutation(trpc.auth.login.mutationOptions({
    onError:(error)=>{
      toast.error(error.message);
    },
    onSuccess:async()=>{
      await queryClient.invalidateQueries(trpc.auth.session.queryFilter())
      router.push("/");
    },
  }))
  const form=useForm<z.infer<typeof loginSchema>>({
      resolver:zodResolver(loginSchema),
        mode: "all",
      defaultValues:{
        email:"",
        password:"",
        
      },
    });

    const onSubmit=(values:z.infer<typeof loginSchema>)=>{
      login.mutate(values);
    }
   
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="bg-[#FFFFFF] h-screen w-full lg:col-span-3 overflow-y-auto">
           <Form {...form}>
            <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
            >
              <div className='flex items-center justify-between mb-8'>
                <Link href="/">
                <span className={cn("text-2xl font-semibold",poppins.className)}>BuyVerse</span>
                </Link>
                <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-base border-none underline"
                >
                  <Link prefetch href="/sign-up">
                  Sign Up
                  </Link>
                </Button>
              </div>
              <h1 className="text-4xl font-medium">
                Welcome Back to BuyVerse.
              </h1>
                
              {/**email */}
              <FormField
              name="email"
              render={({field})=>(
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field}/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              /> 
              {/**emailend */}
              {/**password */}
              <FormField
              name="password"
              render={({field})=>(
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              /> 
              {/***password section end */}
              <Button
              disabled={login.isPending}
              type="submit"
              size="lg"
              variant="elevated"
              className="bg-black text-white hover:bg-[#57564F] hover:text-white"
              >
                Log In
              </Button>
              {/***Button end */}

            </form>
           </Form>
        </div>
        <div className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage:"url('images/auth-bg.png')",
          backgroundSize:"cover",
          backgroundPosition:"center",
          backgroundRepeat:"no-repeat"
        }}
        />
    </div>
  )
}
