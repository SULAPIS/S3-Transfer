import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ContentTable from "@/components/ContentTable";
import { Spinner } from "@/components/ui/spinner";
import { useListContentsQuery } from "@/api/s3Api";
import FolderBar from "@/components/FolderBar";
import ActionButtonsGroup from "@/components/ActionButtonsGroup";
import { useAppSelector } from "@/hook";

export default function Home() {
  const folder = useAppSelector((state) => state.s3.folder);

  const { isFetching, refetch } = useListContentsQuery(folder);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex flex-col px-3 pt-3 gap-3">
        <ActionButtonsGroup />
        <div className="flex items-center gap-2">
          <FolderBar folder={folder} />
          <Button
            className="ml-auto"
            variant={"secondary"}
            disabled={isFetching}
            onClick={() => refetch()}
            size={"icon"}
          >
            {isFetching ? <Spinner /> : <Loader2 />}
          </Button>
        </div>
      </div>

      <ContentTable />
    </div>
  );
}
