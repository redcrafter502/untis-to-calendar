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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { Input } from "@/components/ui/input";
import { formSchema } from "./validators";
import { createAccess, getClasses } from "./server";
import { toast } from "sonner";
import { QrReader } from "./qr-reader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";

const defaultTimezone = "Europe/Berlin";

export default function NewAccessPage() {
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState(searchParams.get("state"));
  const [qrValues, setQrValues] = useState<{
    school: string;
    url: string;
    user: string;
    key: string;
  } | null>(null);

  if (pageState === "qrcode") {
    return (
      <main className="mt-4 mb-4 flex justify-center">
        <QrReader
          onResult={(result) => {
            const untisUrl = new URL(result);
            const url = untisUrl.searchParams.get("url");
            const user = untisUrl.searchParams.get("user");
            const key = untisUrl.searchParams.get("key");
            const school = untisUrl.searchParams.get("school");
            console.log(url, user, key, school);
            if (
              !url ||
              !user ||
              !key ||
              !school ||
              !result.startsWith("untis://setschool")
            ) {
              toast.error("Invalid QR Code");
              return;
            }
            setQrValues({ url, user, key, school });

            setPageState("secret");
          }}
        />
      </main>
    );
  }
  if (
    pageState === "public" ||
    pageState === "password" ||
    pageState === "secret"
  ) {
    return (
      <main className="mt-4 mb-4 flex w-full flex-col items-center gap-4">
        <h1 className="text-4xl">Creating a new {pageState} Access</h1>
        {pageState === "secret" && !!qrValues ? (
          <CreateForm
            defaultTimezone={defaultTimezone}
            defaultDomain={qrValues.url}
            defaultSchool={qrValues.school}
            authType={pageState}
            defaultUsername={qrValues.user}
            defaultSecret={qrValues.key}
          />
        ) : (
          <CreateForm
            defaultTimezone={defaultTimezone}
            defaultDomain="neilo.webuntis.com"
            defaultSchool=""
            authType={pageState}
          />
        )}
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
  const [classes, setClasses] = useState<
    { id: number; name: string }[] | undefined
  >(undefined);
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
  const router = useRouter();

  async function onSubmit(values: typeof formSchema.infer) {
    const result = await createAccess(values);
    if (result?.error) return toast.error(result.error);
    router.push("/dashboard");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
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
        {authType === "public" && !classes && (
          <Button
            onClick={async () => {
              console.log("Querying classes...");
              const classes = await getClasses(
                form.getValues().school,
                form.getValues().domain,
              );
              console.log("Classes:", classes);
              setClasses(classes);
            }}
          >
            Query Classes
          </Button>
        )}
        {authType === "public" && !!classes && (
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <Select {...field}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((class_) => (
                    <SelectItem key={class_.id} value={class_.id.toString()}>
                      {class_.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
