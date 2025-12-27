import { FormSchemaType } from "@/routes/setting";
import { Control, Controller } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface Props {
  control: Control<FormSchemaType>;
}

export default function CognitoSetting({ control }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Controller
          name="region"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="region">
                Region
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="region"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />{" "}
        <Controller
          name="bucket"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="bucket">
                Bucket
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="bucket"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Controller
          name="userPoolId"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="userPoolId">
                User Pool ID
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="userPoolId"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          name="clientId"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="clientId">
                Client ID
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="clientId"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </div>
      <Controller
        name="identityPoolId"
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
            <FieldLabel className="whitespace-nowrap" htmlFor="identityPoolId">
              Identity Pool ID
            </FieldLabel>
            <Input
              {...field}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              id="identityPoolId"
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />
      <div className="grid grid-cols-2 gap-2">
        <Controller
          name="username"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="username">
                Username
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="username"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel className="whitespace-nowrap" htmlFor="password">
                Password
              </FieldLabel>
              <Input
                {...field}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                id="password"
                aria-invalid={fieldState.invalid}
                type="password"
              />
            </Field>
          )}
        />
      </div>
    </div>
  );
}
