import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { stackServerApp } from "@/stack";
import { ArrowRight, ScanQrCode } from "lucide-react";

export default async function DashboardPage() {
  await stackServerApp.getUser({ or: "redirect" });
  return (
    <main className="mt-4 flex w-full flex-col items-center gap-4">
      <div className="flex flex-col gap-4">
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
                <Button className="w-full">
                  Get Started <ArrowRight />
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
              <Button variant="secondary">
                Get Started <ArrowRight />
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
              <Button variant="secondary">
                Get Started <ArrowRight />
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
              <Button variant="secondary">
                Get Started <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div>
        <h1>Dashboard</h1>
      </div>
    </main>
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
