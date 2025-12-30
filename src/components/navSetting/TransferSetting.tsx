import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/hook";
import { open } from "@tauri-apps/plugin-dialog";
import { settingActions } from "@/features/settingSlice";

export default function TransferSetting() {
  const dispatch = useAppDispatch();
  const downloadPath = useAppSelector((state) => state.setting.downloadPath);

  return (
    <div className="flex flex-col">
      <Field orientation={"horizontal"}>
        <FieldLabel className="whitespace-nowrap" htmlFor="downloadPath">
          Download Path
        </FieldLabel>
        <Input id="downloadPath" value={downloadPath} disabled />
        <Button
          variant={"secondary"}
          onClick={async () => {
            const newDownloadPath = await open({
              directory: true,
              defaultPath: downloadPath,
            });
            if (newDownloadPath !== null) {
              dispatch(settingActions.setDownloadPath(newDownloadPath));
            }
          }}
        >
          Browse
        </Button>
      </Field>
    </div>
  );
}
