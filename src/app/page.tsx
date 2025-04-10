// src/app/page.tsx
"use client";
// Reuse the dashboard component logic for the home page
import DashboardPage from "./(tabs)/dashboard/page";

export default function HomePage() {
  return <DashboardPage />;
}
