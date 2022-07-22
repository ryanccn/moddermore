import * as AlertDialog from '@radix-ui/react-alert-dialog';

const ProgressOverlay = ({ value, max }: { value: number; max: number }) => {
  return (
    <AlertDialog.Root defaultOpen={true}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-white/75 backdrop-blur-md dark:bg-zinc-900/75" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[88] flex max-h-[85vh] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-6 rounded-lg bg-zinc-100 p-8 dark:bg-zinc-800">
          <AlertDialog.Title>
            <h2 className="text-lg font-medium">
              Searching for mods... ({value} / {max})
            </h2>
          </AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </AlertDialog.Description>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ProgressOverlay;
