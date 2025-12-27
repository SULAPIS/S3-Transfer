import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { JSX } from "react";
import { S3Action } from "@/features/s3Slice";
import { useAppDispatch } from "@/hook";

interface Props {
  folder: string;
}

export default function FolderBar({ folder }: Props) {
  const dispatch = useAppDispatch();

  let prefix = "/";
  const prefixes = [
    {
      name: "/",
      prefix: "/",
    },
    ...folder
      .split("/")
      .filter((v) => v !== "")
      .map((v) => {
        prefix += v + "/";
        return {
          name: v + "/",
          prefix,
        };
      }),
  ];

  let buttons: JSX.Element[] = [];
  prefixes.forEach((item, index) => {
    if (index !== 0) {
      buttons.push(<ChevronRight size={18} color="grey" />);
    }
    buttons.push(
      <Button
        key={item.prefix}
        variant={"link"}
        className="underline h-auto p-0 font-normal text-foreground hover:text-foreground/50"
        onClick={() => dispatch(S3Action.setFolder(item.prefix))}
      >
        {item.name}
      </Button>
    );
  });

  return <div className="flex items-center gap-2">{...buttons}</div>;
}
