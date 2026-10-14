"use client";

// Next
import useSWR from "swr";

// The url is the cache key: same url, one request; new url, refetch. Pass null to skip.
// Routes under app/api answer { status, message, payload }.
export const useApiFetch = <T,>(url: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(url, async (path: string) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  });

  return { data: data?.payload as T | undefined, isLoading, error, refresh: mutate };
};
