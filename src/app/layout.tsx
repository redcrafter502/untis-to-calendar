import "./globals.css";

export const metadata: Metadata = {
  title: "Untis to Calendar",
  description: "Sync your untis timetable with your calendar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
