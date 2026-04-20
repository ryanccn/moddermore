"use client";

import { useEffect, useState } from "react";
import { GlobeIcon, LockIcon, ShieldIcon } from "lucide-react";
import { Select } from "~/components/ui/Select";
import type { ListVisibility } from "~/types/moddermore";

export const HomeVisibilityDemo = () => {
  const [mockVisibility, setMockVisibility] = useState<ListVisibility>("private");

  useEffect(() => {
    const intvl = setInterval(() => {
      setMockVisibility(
        mockVisibility === "private" ? "unlisted" : mockVisibility === "unlisted" ? "public" : "private",
      );
    }, 2500);

    return () => {
      clearInterval(intvl);
    };
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Select
        name="visibility"
        value={"private"}
        currentValue={mockVisibility}
        className="p-6 transition-colors"
      >
        <div className="flex flex-row items-center gap-x-2">
          <LockIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
          <span className="font-display text-xl font-medium">Private</span>
        </div>
        <span className="text-base opacity-60">
          Only accessible by you. Others visiting the link will see a 404.
        </span>
      </Select>
      <Select
        name="visibility"
        value={"unlisted"}
        currentValue={mockVisibility}
        className="p-6 transition-colors"
      >
        <div className="flex flex-row items-center gap-x-2">
          <ShieldIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
          <span className="font-display text-xl font-medium">Unlisted</span>
        </div>
        <span className="text-base opacity-60">
          Anyone with the link will be able to see the list, and it should not be indexed by search engines.
        </span>
      </Select>
      <Select
        name="visibility"
        value={"public"}
        currentValue={mockVisibility}
        className="p-6 transition-colors"
      >
        <div className="flex flex-row items-center gap-x-2">
          <GlobeIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
          <span className="font-display text-xl font-medium">Public</span>
        </div>
        <span className="text-base opacity-60">
          Anyone with the link will be able to see the list, and it will be available both in Search and to
          search engines.
        </span>
      </Select>
    </div>
  );
};
