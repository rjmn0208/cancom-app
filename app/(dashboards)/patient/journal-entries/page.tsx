"use client";

import { JournalEntryCard } from "@/components/JournalEntryCard";
import JournalEntryForm from "@/components/JournalEntryForm";
import { JournalEntry, JournalTag } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const JournalEntryPage = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const searchJournal = (journal: JournalEntry, query: string) => {
    const searchFields = [
      journal.title,
      journal.content,
      journal.mood,
      ...(journal.JournalTag?.map((tag: any) => tag.value) || []),
    ];

    return searchFields.some(
      (field) => field && field.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredJournals = journals.filter((journal) => searchJournal(journal, searchQuery));

  const fetchJournals = async () => {
    const supabase = createClient();

    const getPatientId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("Patient")
        .select("id")
        .eq("userId", user?.id)
        .single();
      if (!error && data) return data.id;
    };

    let patientId = await getPatientId();

    const { data, error } = await supabase
      .from("JournalEntry")
      .select(
        `
      *,
      Patient(*),
      JournalTag(*)
    `
      )
      .eq("patientId", patientId);

    if (!error) setJournals(data);
  };

  const handleDeleteJournal = async (journal: JournalEntry) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("JournalEntry")
      .delete()
      .eq("id", journal.id);

    if (!error) {
      toast.success("Journal deleted successfully");
      fetchJournals();
    }
  };

  const handleJournalTagDelete = async (tag: JournalTag) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("JournalTag")
      .delete()
      .eq("id", tag.id);

    if (!error) {
      toast.success("Tag deleted successfully");
      fetchJournals();
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) fetchJournals();
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Journal Entries</h1>
      <div className="flex items-center gap-4 m-5">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search journals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-4/5"
        />
      </div>
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Journal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write your journal below</DialogTitle>
            <JournalEntryForm />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {filteredJournals.map((journal) => (
          <JournalEntryCard
            key={journal.id}
            journal={journal}
            onDelete={handleDeleteJournal}
            onOpenChange={handleOpenChange}
            onTagDelete={handleJournalTagDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalEntryPage;
