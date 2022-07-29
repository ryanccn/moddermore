import Modalistic from './Modalistic';

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
    <Modalistic>
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
    </Modalistic>
  );
};

export default ProgressOverlay;
