"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JournalEntry, JournalTag } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Tag, Trash2, X } from "lucide-react";
import JournalEntryForm from "./JournalEntryForm";
import JournalTagForm from "./JournalTagForm";

interface JournalEntryCardProps {
  journal: JournalEntry;
  onDelete: (journal: JournalEntry) => void;
  onOpenChange: (open: boolean) => void;
  onTagDelete: (tag: JournalTag) => void;
}

export function JournalEntryCard({
  journal,
  onDelete,
  onOpenChange,
  onTagDelete,
}: JournalEntryCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{journal.title}</CardTitle>
        <CardDescription>
          {new Date(journal.dateEntered).toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          Mood: {journal.mood}
        </p>
        <div className="flex flex-wrap gap-1">
          {journal.JournalTag?.map((tag: JournalTag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: tag.color, color: "white" }}
            >
              {tag.value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-white/20"
                aria-label={`Delete ${tag.value} tag`}
                onClick={() => onTagDelete(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">View</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{journal.title}</DialogTitle>
              <DialogDescription>
                {new Date(journal.dateEntered).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                - Mood: {journal.mood}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p>{journal.content}</p>
            </div>
          </DialogContent>
        </Dialog>
        <div className="space-x-2">
          <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit journal entry"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <JournalTagForm journal={journal} />
            </DialogContent>
          </Dialog>
          <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit journal entry"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <JournalEntryForm journalEntry={journal} />
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(journal)}
            aria-label="Delete journal entry"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
