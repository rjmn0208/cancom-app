import { createClient } from "@/utils/supabase/server";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { signOutAction } from "@/app/auth/auth-actions";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const UserDetails = async () => {
  const supabase = createClient();

  // Fetch the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error fetching user information.
      </div>
    );
  }

  // Fetch additional user details from the 'User' table
  const { data: userDetails, error: detailsError } = await supabase
    .from("User")
    .select("firstName, middleName ,lastName, userType")
    .eq("id", user.id)
    .single();

  if (detailsError) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error fetching user details from the database.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          {userDetails?.firstName} {userDetails?.middleName}{" "}
          {userDetails?.lastName}
        </p>
        <p>{user.email}</p>
        <Badge>{userDetails.userType}</Badge>
      </CardContent>
      <CardFooter>
        <form action={signOutAction}>
          <Button variant="destructive" type="submit">
            Sign Out
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default UserDetails;
