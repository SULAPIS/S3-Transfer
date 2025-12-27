import TransferSelectButton from "@/components/TransferSidebarButton";
import TransferStatusTable from "@/components/TransferStatusTable";
import { useAppSelector } from "@/hook";
import { useMemo, useState } from "react";

type TransferSelect = "uploading" | "downloading" | "finished";

export default function Transfer() {
  const transfers = useAppSelector((state) => state.transfer.transfers);
  const [select, setSelect] = useState<TransferSelect>("finished");

  const { uploading, downloading, finished } = useMemo(() => {
    return {
      uploading: transfers.filter(
        (v) => v.status !== "finished" && v.type === "upload"
      ),
      downloading: transfers.filter(
        (v) => v.status !== "finished" && v.type === "download"
      ),
      finished: transfers.filter((v) => v.status === "finished"),
    };
  }, [transfers]);
  const uploadingCount = uploading.length;
  const downloadingCount = downloading.length;

  let data;
  switch (select) {
    case "downloading":
      data = downloading;
      break;
    case "finished":
      data = finished;
      break;
    case "uploading":
      data = uploading;
      break;
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col items-center border-r-2 w-48 p-3 gap-1">
        <TransferSelectButton
          isActive={select === "uploading"}
          onClick={() => setSelect("uploading")}
          count={uploadingCount}
        >
          Uploading
        </TransferSelectButton>

        <TransferSelectButton
          isActive={select === "downloading"}
          onClick={() => {
            setSelect("downloading");
          }}
          count={downloadingCount}
        >
          Downloading
        </TransferSelectButton>
        <TransferSelectButton
          isActive={select === "finished"}
          onClick={() => {
            setSelect("finished");
          }}
        >
          Finished
        </TransferSelectButton>
      </div>
      <div className="flex-1">
        <TransferStatusTable data={data} />
      </div>
    </div>
  );
}
