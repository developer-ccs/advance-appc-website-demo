import { ChevronRight, LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded hover:border-blue-900 hover:bg-blue-50 hover:cursor-pointer transition group"
    >
      <div className="flex items-center text-gray-700 group-hover:text-blue-900 font-medium">
        <Icon className="text-red-900 mr-3 w-5 h-5" />
        {label}
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-900" />
    </button>
  );
}
