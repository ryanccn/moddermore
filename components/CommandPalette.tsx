import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { Command } from 'cmdk';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const CommandPalette = () => {
  const router = useRouter();
  const [showCmd, setShowCmd] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setShowCmd((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={showCmd}
      onOpenChange={setShowCmd}
      label="Command Palette"
    >
      <Command.Input placeholder="Type your command here..." />

      <Command.List>
        <Command.Empty className="text-center text-black/75 dark:text-white/75">
          No results found.
        </Command.Empty>

        <Command.Item
          onSelect={() => {
            router.push('/new');
          }}
        >
          Create a new list
        </Command.Item>
        <Command.Item
          onSelect={() => {
            supabaseClient.auth.signOut();
          }}
        >
          Sign out
        </Command.Item>
      </Command.List>
    </Command.Dialog>
  );
};
