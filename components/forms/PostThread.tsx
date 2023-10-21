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
import { Textarea } from "../ui/textarea";

import { usePathname, useRouter } from "next/navigation";

import { ThreadValidation } from "@/lib/validations/threads";
import { log } from "console";
import { createThread } from "@/lib/actions/threads.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const PostThread = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push("/");
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col text-light-2">
              {/* <FormLabel className="text-base-semibold text-gray-200">
                Content
              </FormLabel> */}
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
          <Button type="submit" className="bg-primary-500 w-[90%]">
            Post Thread
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostThread;
