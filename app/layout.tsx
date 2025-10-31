import "./globals.css";

export const metadata = {
  title: "AI Travel Planner",
  description: "Simple AI travel itinerary generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-base bg-background text-text">
        {children}
      </body>
    </html>
  );
}
