import { Spinner } from "@/components/ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="flex w-full h-screen gap-2 justify-center items-center">
      <Spinner />
      <p>Loading...</p>
    </div>
  );
}
