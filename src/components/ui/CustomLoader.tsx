import { Loader } from "lucide-react";

interface LoaderProps {
  message?: string;
  fullPage?: boolean;
}

export default function CustomLoader({
  message = "Loading...",
  fullPage = false,
}: LoaderProps) {
  if (fullPage) {
    return (
      <div className="flex h-[calc(80dvh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader className="w-8 h-8 animate-spin text-blue-900" />
          <span className="text-sm">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-500">
      <Loader className="w-4 h-4 animate-spin text-blue-900" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
