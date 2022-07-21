const ProgressOverlay = ({ value, max }: { value: number; max: number }) => {
  return (
    <div className="min-w-screen absolute inset-0 z-[9999] grid min-h-screen place-items-center bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
      <div className="flex flex-col items-center space-y-6 rounded-lg bg-zinc-100 p-8 dark:bg-zinc-800">
        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full bg-indigo-600"
            style={{ width: `${(value / max) * 100}%` }}
          ></div>
        </div>
        <h2 className="text-lg font-medium">
          Searching for mods... ({value} / {max})
        </h2>
      </div>
    </div>
  );
};

export default ProgressOverlay;
