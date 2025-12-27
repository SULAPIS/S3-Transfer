import { useLoginMutation } from "@/api/cognitoApi";
import CognitoSetting from "@/components/navSetting/CognitoSetting";
import TransferSetting from "@/components/navSetting/TransferSetting";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authActions } from "@/features/authSlice";
import { settingActions } from "@/features/settingSlice";
import { useAppDispatch, useAppSelector } from "@/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const navSetting = {
  Cognito: CognitoSetting,
  Transfer: TransferSetting,
};
type NavKey = keyof typeof navSetting;

const formSchema = z.object({
  region: z.string(),
  bucket: z.string(),
  clientId: z.string(),
  userPoolId: z.string(),
  identityPoolId: z.string(),
  username: z.string(),
  password: z.string(),
  downloadPath: z.string(),
});
export type FormSchemaType = z.infer<typeof formSchema>;

export default function Setting() {
  const dispatch = useAppDispatch();
  const setting = useAppSelector((state) => state.setting);
  const [login, { isLoading }] = useLoginMutation();

  const [nav, setNav] = useState<NavKey>("Cognito");
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
      downloadPath: setting.downloadPath ?? "",
      ...setting.cognitoSetting,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await login({
        cognitoSetting: { ...data },
        ...data,
      });
      if (response.error) {
        toast.warning(response.error as string);
      } else if (response.data) {
        dispatch(
          settingActions.setSetting({
            cognitoSetting: { ...data },
            downloadPath: data.downloadPath,
          })
        );
        dispatch(authActions.setToken(response.data.refreshToken));
        dispatch(authActions.setAwsCredentials(response.data.credentials));
        toast.success("Succeed to login.");
      }
    } catch (error) {
      toast.error("Failed to login.");
    }
  }

  const CurrentComponent = navSetting[nav];

  return (
    <div className="h-full flex">
      <li className="flex flex-col w-48 border-r-2">
        {(Object.keys(navSetting) as NavKey[]).map((key) => (
          <Button
            className="rounded-none"
            key={key}
            onClick={() => {
              setNav(key);
            }}
            variant={key === nav ? "default" : "ghost"}
          >
            {key}
          </Button>
        ))}
      </li>
      <div className="flex-1 flex flex-col p-8">
        <div className="flex-1 ">
          {<CurrentComponent control={form.control} />}
        </div>
        <div className="flex justify-end">
          <Button
            className="flex items-center justify-center"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
            {isLoading && <Spinner />}
          </Button>
        </div>
      </div>
    </div>
  );
}
