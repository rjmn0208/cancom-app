import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { createClient } from "@/utils/supabase/client";
import { ListMembership, ListPermission } from "@/lib/types";
import { Badge } from "./ui/badge";
import ListMemberForm from "./ListMemberForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ListMembershipTableProps {
  taskListId: number;
}

const ListMembershipTable: React.FC<ListMembershipTableProps> = ({
  taskListId,
}) => {
  const [listMembers, setListMembers] = useState<ListMembership[]>([]);
  const [permission, setPermission] = useState<ListPermission>();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const fetchTaskListData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: PatientData, error: PatientError } = await supabase
      .from("Patient")
      .select("id")
      .eq("userId", user?.id)
      .single();

    if (PatientError) return;

    const { data: TaskListData, error: TaskListError } = await supabase
      .from("TaskList")
      .select("patientId")
      .eq("patientId", PatientData?.id)
      .single();

    if (!TaskListError) setIsOwner(PatientData.id === TaskListData.patientId);
  };

  const fetchTaskListMembers = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("ListMembership")
      .select("*, User(*)")
      .eq("taskListId", taskListId);

    if (!error) setListMembers(data);
  };

  const fetchPermission = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ListMembership")
      .select("permission")
      .eq("userId", user?.id)
      .eq("taskListId", taskListId)
      .single();

    if (!error) setPermission(data.permission);
  };

  const handleDelete = async (listMember: ListMembership) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ListMembership")
      .delete()
      .eq("id", listMember.id);

    fetchTaskListMembers();
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) fetchTaskListMembers();
  };

  const isListManager = () => {
    return permission === ListPermission.MANAGER;
  };

  useEffect(() => {
    fetchTaskListMembers();
    fetchPermission();
    fetchTaskListData();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Permission</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listMembers.map((listMember: ListMembership) => (
          <TableRow>
            <TableCell>{listMember.id}</TableCell>
            <TableCell>
              <p>
                {listMember.User.firstName} {listMember.User.middleName}{" "}
                {listMember.User.lastName}
              </p>
              <Badge>{listMember.User.userType}</Badge>
            </TableCell>
            <TableCell>
              <Badge>{listMember.permission}</Badge>
            </TableCell>
            <TableCell>
              {new Date(listMember.startDate).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </TableCell>
            <TableCell>
              {new Date(listMember.endDate).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </TableCell>
            <TableCell>
              {isOwner || isListManager() ? (
                <div>
                  <Dialog onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant={"outline"}>Edit</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Input Vital Reading Details</DialogTitle>
                      </DialogHeader>
                      <ListMemberForm listMember={listMember} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant={"destructive"}
                    className="mt-2"
                    onClick={() => handleDelete(listMember)}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <></>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ListMembershipTable;
