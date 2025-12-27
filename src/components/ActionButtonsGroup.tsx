import { FolderPlus, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/hook";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { s3Api, useCreateFolderMutation } from "@/api/s3Api";
import { toast } from "sonner";
import { open as openFileSelector } from "@tauri-apps/plugin-dialog";

export default function ActionButtonsGroup() {
  const dispatch = useAppDispatch();
  const [createFolder, { isLoading }] = useCreateFolderMutation();
  const folder = useAppSelector((state) => state.s3.folder);
  const [newFolderName, setNewFolderName] = useState("");
  const [err, setErr] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (newFolderName.includes("/")) {
      setErr("Folder name cannot contain '/'");
      return;
    }

    try {
      await createFolder(folder + newFolderName + "/").unwrap();

      toast.success("Folder has been created");
      setOpen(false);
      setNewFolderName("");
      setErr("");
    } catch (error) {
      console.error("Failed to create folder", error);
      toast.error("Failed to create folder");
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={async () => {
          const filePaths = (await openFileSelector({ multiple: true })) ?? [];
          for (const path of filePaths) {
            dispatch(
              s3Api.endpoints.uploadObject.initiate({ filePath: path, folder })
            );
          }
        }}
      >
        <Upload />
        Upload
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"secondary"} onClick={() => {}}>
            <FolderPlus />
            Create New Folder
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="name-1">Folder Name</Label>
            <Input
              id="name-1"
              name="name"
              value={newFolderName}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              onChange={(e) => {
                setNewFolderName(e.target.value);
                if (err) setErr("");
              }}
            />{" "}
            {err && <p className="text-sm text-red-500">{err}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
