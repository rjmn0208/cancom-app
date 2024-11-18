import { signInWithGoogle } from "@/app/auth/auth-actions";
import React from "react";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";

const GoogleSignInButton = () => {
  return (
    <form action={signInWithGoogle}>
      <Button>
        <FcGoogle className="mr-2" /> Sign In With Google
      </Button>
    </form>
  );
};

export default GoogleSignInButton;
