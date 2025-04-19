import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { stackServerApp } from "@/stack";
import { ArrowRight, Loader2, ScanQrCode } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { QUERIES } from "@/db/queries";
import { UrlDisplayInput, UrlCopyButton } from "./client";

export default async function DashboardPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  return (
    <main className="mt-4 mb-4 flex w-full justify-center">
      <div className="flex flex-col gap-8">
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-4xl">Create a new Access</h1>
          <Card>
            <CardHeader>
              <CardTitle>Scan a QR code</CardTitle>
              <CardDescription>
                Scan the QR code from your Untis Account.
              </CardDescription>
              <CardContent className="flex items-end space-x-2">
                <div className="flex flex-col gap-4">
                  <p className="text-sm">
                    Scanning the QR code is the recommended, easiest and most
                    secure way to connect your untis account to "Untis to
                    calendar".
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/new?state=qrcode">
                      Get Started <ArrowRight />
                    </Link>
                  </Button>
                </div>
                <ScanQrCode size={128} className="min-w-32" />
              </CardContent>
            </CardHeader>
          </Card>
          <div className="flex w-full gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Public</CardTitle>
                <CardDescription>
                  Access a public timetable on untis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href="/dashboard/new?state=public">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Access your timetable using your untis password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href="/dashboard/new?state=password">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Secret</CardTitle>
                <CardDescription>
                  Access your timetable using your untis secret.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href="/dashboard/new?state=secret">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-red-500">
            QR Code and Public are not yet implemented.
          </p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <h1 className="text-4xl">Your Accesses</h1>
          {((user.serverMetadata?.accesses ?? []) as string[]).map((access) => (
            <Suspense
              key={access}
              fallback={
                <div className="flex w-full justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              }
            >
              <AccessCard accessId={access} />
            </Suspense>
          ))}
        </div>
      </div>
    </main>
  );
}

async function AccessCard({ accessId }: { accessId: string }) {
  const access = await QUERIES.getAccessById(accessId);
  if (access.isErr())
    return <div className="text-red-500">Error: {access.error}</div>;

  const path = `/api/ics/${accessId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{access.value.name}</CardTitle>
        <CardDescription>
          {access.value.school} ({access.value.domain} - {access.value.timezone}
          )
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>Auth Type: {access.value.authType}</p>
        <div className="flex w-full gap-4">
          <UrlDisplayInput path={path} />
          <UrlCopyButton path={path} />
        </div>
      </CardContent>
    </Card>
  );
}

/*

Create section
- start form
  - 4 cards
    - big qr code card
    - Public
    - Password
    - Secret
  - when clicking on a card a modal opens

- modal
  - qr code
    - option to scan qr code
    - manual with qr code values
  - manual
    - form with manual inputs
      - Name = ""
      - Domain = qrcode || "neilo.webuntis.com"
      - School = qrcode || ""
      - Timezone = defaultTimezone || "Europe/Berlin"
      - Auth Type = card
      - ClassId? = "" (manual button to fetch options)
      - Username = qrcode || ""
      - Password = ""
      - Secret = qrcode || ""

View section


*/
