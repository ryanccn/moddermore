import { UploadIcon } from "lucide-react";
import { Button } from "../shadcn/button";
import { Spinner } from "./Spinner";

interface Props {
  submitting?: boolean;
  disabled?: boolean;
}

export const NewSubmitButton = ({ submitting, disabled }: Props) => {
  return (
    <Button type="submit" variant="default" size="lg" className="mt-14" disabled={disabled || submitting}>
      {submitting ? <Spinner /> : <UploadIcon />}
      <span>Submit</span>
    </Button>
  );
};
