"use client";

import Image from "next/image";
import { signInWithGoogle } from "@/app/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const SignInPage = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 bg-secondary flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative w-40 h-20">
          <Image
            src="/images/cancomlogo.png"
            alt="Cancer Companion Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Welcome to Cancer Companion
        </h1>
        <Info
          className="w-16 h-16 md:w-24 md:h-24 text-primary"
          aria-hidden="true"
        />
        <p className="text-lg text-center">
          Your companion in the fight against cancer.
        </p>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <form action={signInWithGoogle}>
            <Button className="w-full hover:bg-primary/90 text-xl py-6 rounded-lg transition-all hover:scale-105">
              Sign in with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
