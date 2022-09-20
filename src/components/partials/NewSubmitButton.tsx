import { CloudArrowUpIcon } from '@heroicons/react/20/solid';

interface Props {
  disabled?: boolean;
}

export const NewSubmitButton = ({ disabled }: Props) => {
  return (
    <button
      type="submit"
      className="primaryish-button !mt-14"
      disabled={disabled}
    >
      <CloudArrowUpIcon className="block h-5 w-5" />
      <span>Submit</span>
    </button>
  );
};
