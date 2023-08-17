import { Button } from '../ui/Button';
import { UploadIcon } from 'lucide-react';

interface Props {
  disabled?: boolean;
}

export const NewSubmitButton = ({ disabled }: Props) => {
  return (
    <Button type="submit" className="mt-14" disabled={disabled}>
      <UploadIcon className="block h-5 w-5" />
      <span>Submit</span>
    </Button>
  );
};
