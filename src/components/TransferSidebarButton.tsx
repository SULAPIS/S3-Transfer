import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Pros {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export default function TransferSelectButton({
  children,
  isActive,
  onClick,
  count,
}: Pros) {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "ghost"}
      className="w-full justify-between"
    >
      <span>{children}</span>

      {count !== undefined && count > 0 && (
        <Badge
          variant={isActive ? "secondary" : "default"}
          className="h-5 min-w-5 px-1 text-[11px]"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  );
}
