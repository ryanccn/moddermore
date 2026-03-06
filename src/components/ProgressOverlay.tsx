import { AlertDialog, AlertDialogContent } from "~/components/shadcn/alert-dialog";
import { Progress } from "~/components/shadcn/progress";
import { Field, FieldLabel } from "~/components/shadcn/field";

const ProgressOverlay = ({ value, max, label }: { value: number; max: number; label: string }) => {
  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent>
        <Field>
          <FieldLabel htmlFor="progress">
            <span>{label}</span>
            <span className="ml-auto">
              {value} / {max}
            </span>
          </FieldLabel>
          <Progress id="progress" value={(value / max) * 100} />
        </Field>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ProgressOverlay };
