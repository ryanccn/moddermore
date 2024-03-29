import { UploadIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { Spinner } from "./Spinner";

interface Props {
  submitting?: boolean;
  disabled?: boolean;
}

export const NewSubmitButton = ({ submitting, disabled }: Props) => {
  return (
    <Button type="submit" className="mt-14" disabled={disabled}>
      {submitting ? <Spinner className="block h-5 w-5" /> : <UploadIcon className="block h-5 w-5" />}
      <span>Submit</span>
    </Button>
  );
};
