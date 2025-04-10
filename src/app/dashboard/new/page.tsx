"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { type } from "arktype";
import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { Input } from "@/components/ui/input";

const formSchema = type({
  name: "string > 0",
  timezone: "string > 0",
  domain: "string > 0",
  school: "string > 0",
  authType: "'public' | 'password' | 'secret'",
  "classId?": "string > 0",
  "username?": "string > 0",
  "password?": "string > 0",
  "secret?": "string > 0",
});

export default function NewAccessPage() {
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState(searchParams.get("state"));

  if (pageState === "qrcode") {
    return <main>QR Code</main>;
  }
  if (
    pageState === "public" ||
    pageState === "password" ||
    pageState === "secret"
  ) {
    return (
      <main className="mt-4 flex w-full flex-col items-center gap-4">
        <h1 className="text-4xl">Creating a new {pageState} Access</h1>
        <CreateForm
          defaultTimezone="Europe/Berlin"
          defaultDomain="neilo.webuntis.com"
          defaultSchool=""
          authType={pageState}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
      Unknown state: {pageState}
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </main>
  );
}

function CreateForm({
  defaultTimezone,
  defaultDomain,
  defaultSchool,
  authType,
  defaultUsername,
  defaultSecret,
}: {
  defaultTimezone: string;
  defaultDomain: string;
  defaultSchool: string;
  authType: "public" | "password" | "secret";
  defaultUsername?: string;
  defaultSecret?: string;
}) {
  const form = useForm<typeof formSchema.infer>({
    resolver: arktypeResolver(formSchema),
    defaultValues: {
      name: "",
      timezone: defaultTimezone,
      domain: defaultDomain,
      school: defaultSchool,
      authType,
      classId: "",
      username: defaultUsername ?? "",
      password: "",
      secret: defaultSecret ?? "",
    },
  });

  function onSubmit(values: typeof formSchema.infer) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Timetable" {...field} />
              </FormControl>
              <FormDescription>
                The name of your timetable. This will be displayed in the
                dashboard and your calendar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Input placeholder="Europe/Berlin" {...field} />
              </FormControl>
              <FormDescription>
                The timezone of your timetable. Use the timezone that you see
                your untis timetable in.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <Input placeholder="neilo.webuntis.com" {...field} />
              </FormControl>
              <FormDescription>
                The domain of your untis. Just open untis and look in the url
                bar of your browser.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <FormControl>
                <Input placeholder="Untis School" {...field} />
              </FormControl>
              <FormDescription>
                The school of your untis. Just open untis and look in the url
                bar of your browser.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auth Type</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormDescription>
                The way the timetable should be accessed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {(authType === "password" || authType === "secret") && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="user-456789" {...field} />
                </FormControl>
                <FormDescription>Your untis username.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {authType === "password" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormDescription>Your untis password.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {authType === "secret" && (
          <FormField
            control={form.control}
            name="secret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormDescription>Your untis secret.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
