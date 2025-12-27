import { FormSchemaType } from "@/routes/setting";
import { Control, Controller } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
  control: Control<FormSchemaType>;
}

export default function TransferSetting({ control }: Props) {
  return (
    <div className="flex flex-col">
      <Controller
        name="downloadPath"
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
            <FieldLabel className="whitespace-nowrap" htmlFor="downloadPath">
              Download Path
            </FieldLabel>
            <Input
              {...field}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              id="downloadPath"
              aria-invalid={fieldState.invalid}
              placeholder="/Download"
            />
            <Button variant={"secondary"}>Browse</Button>
          </Field>
        )}
      />
    </div>
  );
}
