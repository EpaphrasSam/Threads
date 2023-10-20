"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import * as z from "zod";
import { Input } from "../ui/input";

import { usePathname, useRouter } from "next/navigation";

import { CommentValidation } from "@/lib/validations/threads";

import { addCommentToThread } from "@/lib/actions/threads.actions";
import { Textarea } from "../ui/textarea";

interface Props {
  threadId: string;
  currentUserImg: string | null;
  currentUserId: string;
}

const Comment = ({ threadId, currentUserId, currentUserImg }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center text-light-2">
              <FormLabel>
                {currentUserImg && (
                  <Image
                    src={currentUserImg}
                    alt="Profile Image"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Textarea
                  //   type="text"
                  style={{ minHeight: "1.5rem" }}
                  rows={1}
                  placeholder="Comment..."
                  {...field}
                  className="no-focus text-light-1 outline-none "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
          <Button type="submit" className="comment-form_btn">
            Reply
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Comment;
