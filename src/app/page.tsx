import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  Clock,
  Laptop,
  Smartphone,
  RefreshCw,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { getStarted } from "./getStarted";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <PageMain />
      <PageFooter />
    </div>
  );
}

function PageHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 flex w-full justify-center border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="inline-block font-bold">Untis to Calendar</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Link href="#features">Features</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Link href="#how-it-works">How It Works</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Link href="#platforms">Supported Platforms</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/handler/sign-in">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/handler/sign-up">Sign up</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function PageMain() {
  return (
    <main className="flex-1">
      <TopSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlatformSections />
      <BottomSection />
    </main>
  );
}

function TopSection() {
  return (
    <section className="flex w-full justify-center py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Sync Your Untis Timetable to Any Calendar
              </h1>
              <p className="text-muted-foreground max-w-[600px] md:text-xl">
                Never miss a class again. Automatically sync your Untis school
                timetable to your calendar app of choice, eg. Google Calendar,
                Apple Calendar, Thunderbird, Outlook, and more.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <form action={getStarted}>
                <Button type="submit" size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
              <Image
                src="/logo.webp"
                alt="Untis to Calendar App"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="flex w-full justify-center bg-slate-50 py-12 md:py-24 lg:py-32 dark:bg-slate-900"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Key Features
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to integrate your timetable into your
              organizational system
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <RefreshCw className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Automated Syncing</h3>
            <p className="text-muted-foreground text-center">
              Set it up once and your timetable stays updated automatically with
              any changes
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Calendar className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Multi-Platform Support</h3>
            <p className="text-muted-foreground text-center">
              Works with all Calendar platforms using the ICS protocol
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Clock className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Real-Time Updates</h3>
            <p className="text-muted-foreground text-center">
              Changes in your Untis timetable are reflected in your calendar
              within minutes (dependent on the configuration of your calendar
              app)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Three simple steps to sync your Untis timetable with your calendar
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold">Connect Your Untis Account</h3>
            <p className="text-muted-foreground text-center">
              Sign up and securely connect your Untis school account
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Choose Your Calendar</h3>
            <p className="text-muted-foreground text-center">
              Select which calendar application you want to sync with
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold">Enjoy Automatic Syncing</h3>
            <p className="text-muted-foreground text-center">
              That's it! Your timetable will now stay in sync automatically
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/get-started">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PlatformSections() {
  return (
    <section
      id="platforms"
      className="w-full bg-slate-50 py-12 md:py-24 lg:py-32 dark:bg-slate-900"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Supported Platforms
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Works seamlessly with your favorite calendar applications and
              devices
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 py-12 md:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Image
              src="/placeholder.svg?height=64&width=64"
              alt="Google Calendar"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <h3 className="text-lg font-medium">Google Calendar</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Image
              src="/placeholder.svg?height=64&width=64"
              alt="Apple Calendar"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <h3 className="text-lg font-medium">Apple Calendar</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Image
              src="/placeholder.svg?height=64&width=64"
              alt="Microsoft Outlook"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <h3 className="text-lg font-medium">Microsoft Outlook</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Image
              src="/placeholder.svg?height=64&width=64"
              alt="Other Calendars"
              width={64}
              height={64}
              className="h-16 w-16"
            />
            <h3 className="text-lg font-medium">Other Calendars</h3>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-6 md:grid-cols-3">
          <div className="flex items-center justify-center space-x-2 rounded-lg border p-4">
            <Laptop className="text-primary h-8 w-8" />
            <span className="text-lg font-medium">Web Browser</span>
          </div>
          <div className="flex items-center justify-center space-x-2 rounded-lg border p-4">
            <Smartphone className="text-primary h-8 w-8" />
            <span className="text-lg font-medium">iOS App</span>
          </div>
          <div className="flex items-center justify-center space-x-2 rounded-lg border p-4">
            <Smartphone className="text-primary h-8 w-8" />
            <span className="text-lg font-medium">Android App</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BottomSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Ready to Simplify Your Schedule?
            </h2>
            <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of students who have already synchronized their
              Untis timetables
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" asChild>
              <Link href="/get-started">
                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageFooter() {
  return (
    <footer className="w-full border-t bg-slate-50 py-6 dark:bg-slate-900">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <p className="text-muted-foreground text-sm">
            © 2023 Untis to Calendar. All rights reserved.
          </p>
        </div>
        <nav className="text-muted-foreground flex gap-4 text-sm">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
