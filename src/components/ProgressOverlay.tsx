import * as Dialog from "@radix-ui/react-dialog";

const ProgressOverlay = ({ value, max, label }: { value: number; max: number; label: string }) => {
  return (
    <Dialog.Root defaultOpen={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog overlay" />
        <Dialog.Content
          className="dialog content"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col items-center gap-y-6">
            <Dialog.Title className="text-lg font-medium" id="searching-for-mods-label">
              {label} ({value} / {max})
            </Dialog.Title>

            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={value}
              aria-labelledby="searching-for-mods-label"
            >
              <div
                className="h-full w-full rounded-full bg-indigo-600 transition-transform"
                style={{
                  transform: `translateX(calc(${(value / max) * 100}% - 100%))`,
                }}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { ProgressOverlay };
