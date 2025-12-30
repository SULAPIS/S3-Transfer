import { Outlet } from "react-router";

import SidebarNavLink from "@/components/SidebarNavLink";
import { ArrowDownUp, Cloud, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hook";
import {
  uploadProgressHandler,
  useTauriEvent,
} from "@/hook/useTauriEventEffect";

export default function SidebarLayout() {
  const dispatch = useAppDispatch();
  const transfers = useAppSelector((state) => state.transfer.transfers);
  const transferringCount =
    transfers.length - transfers.filter((v) => v.status === "finished").length;

  useTauriEvent("upload-progress", dispatch, uploadProgressHandler);

  return (
    <div className="flex h-full">
      <nav className="w-18 border-r-2 flex flex-col items-center gap-2 py-4">
        <SidebarNavLink to={`/`} Icon={Cloud}>
          Home
        </SidebarNavLink>

        <SidebarNavLink
          to={`/transfer`}
          Icon={ArrowDownUp}
          count={transferringCount}
        >
          Transfer
        </SidebarNavLink>

        <SidebarNavLink className="mt-auto" to={`/setting`} Icon={Settings}>
          Setting
        </SidebarNavLink>
      </nav>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
