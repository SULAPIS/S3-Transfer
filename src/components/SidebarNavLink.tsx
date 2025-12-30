import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { Badge } from "./ui/badge";

interface Props {
  children: React.ReactNode;
  to: string;
  Icon: LucideIcon;
  count?: number;
  className?: string;
}

export default function SidebarNavLink({
  className,
  children,
  to,
  Icon,
  count,
}: Props) {
  return (
    <NavLink
      className={({ isActive, isPending }) =>
        cn(
          "relative rounded-xl flex flex-col text-[10px] items-center justify-center w-14 h-14 transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : isPending
            ? "bg-gray-100/50"
            : "hover:bg-accent",
          className
        )
      }
      to={to}
    >
      <Icon size={24} strokeWidth={3} />
      {children}
      {count !== undefined && count > 0 && (
        <Badge
          variant="destructive"
          className="absolute h-5 min-w-5 rounded-full px-1 font-mono tabular-nums right-1 top-1"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </NavLink>
  );
}
