import { Root as Portal } from '@radix-ui/react-portal';

const ProgressOverlay = ({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) => {
  return (
    <Portal container={document.body}>
      <div className="fixed inset-0 bg-white/75 backdrop-blur-md dark:bg-zinc-900/75" />
      <div
        className="fixed top-1/2 left-1/2 z-[88] flex max-h-[85vh] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col items-center space-y-6 rounded-lg bg-zinc-50 p-8 dark:bg-zinc-800"
        role="dialog"
        aria-labelledby="searching-for-mods-label"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium" id="searching-for-mods-label">
          {label} ({value} / {max})
        </h2>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
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
    </Portal>
  );
};

export default ProgressOverlay;
