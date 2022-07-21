import { UploadIcon } from '@heroicons/react/outline';

interface Props {
  disabled?: boolean;
}

export default function NewSubmitButton({ disabled }: Props) {
  return (
    <button
      type="submit"
      className="primaryish-button !mt-14"
      disabled={disabled}
    >
      <UploadIcon className="block h-5 w-5" />
      <span>Submit</span>
    </button>
  );
}
