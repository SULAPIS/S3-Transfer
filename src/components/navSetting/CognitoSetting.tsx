import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLoginMutation } from "@/api/cognitoApi";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingActions } from "@/features/settingSlice";
import { authActions } from "@/features/authSlice";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  region: z.string().min(1),
  bucket: z.string().min(1),
  clientId: z.string().min(1),
  userPoolId: z.string().min(1),
  identityPoolId: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});
export type FormSchemaType = z.infer<typeof formSchema>;

export default function CognitoSetting() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const cognitoSetting = useAppSelector(
    (state) => state.setting.cognitoSetting
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
      bucket: "",
      clientId: "",
      userPoolId: "",
      identityPoolId: "",
      username: "",
      password: "",
      ...cognitoSetting,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const { refreshToken, credentials } = await login({
        cognitoSetting: {
          ...data,
        },
        username: data.username,
        password: data.password,
      }).unwrap();
      dispatch(settingActions.setCognitoSetting({ ...data }));
      dispatch(authActions.setToken(refreshToken));
      dispatch(authActions.setAwsCredentials(credentials));
      toast.success("Succeed to login.");
    } catch (error) {
      toast.error("Failed to login.");
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className=" flex-1 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Controller
            name="region"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
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
          />
          <Controller
            name="bucket"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
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
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
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
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
                <FieldLabel className="whitespace-nowrap" htmlFor="clientId">
                  App Client ID
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
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
              <FieldLabel
                className="whitespace-nowrap"
                htmlFor="identityPoolId"
              >
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
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
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
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={"horizontal"}
                data-invalid={fieldState.invalid}
              >
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
      <div className="flex justify-end">
        <Button
          className="flex items-center justify-center"
          disabled={isLoading}
          onClick={form.handleSubmit(onSubmit)}
        >
          Login
          {isLoading && <Spinner />}
        </Button>
      </div>
    </div>
  );
}
