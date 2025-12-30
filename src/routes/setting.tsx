import CognitoSetting from "@/components/navSetting/CognitoSetting";
import TransferSetting from "@/components/navSetting/TransferSetting";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navSetting = {
  Cognito: CognitoSetting,
  Transfer: TransferSetting,
};
type NavKey = keyof typeof navSetting;

export default function Setting() {
  const [nav, setNav] = useState<NavKey>("Cognito");

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
      <div className="flex-1 p-8">{<CurrentComponent />}</div>
    </div>
  );
}
