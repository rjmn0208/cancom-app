"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserForm from "@/components/UserForm";
import { User } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("User").select("*");

    if (!error) setUsers(data);
  };

  const handleUserDelete = async (user: User) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("User")
      .delete()
      .eq("id", user.id);

    fetchUsers();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Honorific</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.honorific}</TableCell>
                <TableCell>
                  {user.firstName} {user.middleName} {user.lastName}
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>
                  <Badge variant={"outline"}>{user.userType}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog onOpenChange={(open) => handleOpenChange(open)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Input Vital Details</DialogTitle>
                        </DialogHeader>
                        <UserForm userData={user} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUserDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
