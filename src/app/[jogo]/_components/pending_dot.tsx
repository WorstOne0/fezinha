"use client";

// Next
import { useLinkStatus } from "next/link";

// Rendered inside each game link: pulses from the click until the new page starts streaming.
export default function PendingDot() {
  const { pending } = useLinkStatus();

  return <span className={`h-[1rem] w-[1rem] rounded-full bg-action ${pending ? "animate-ping" : ""}`} />;
}
