const BADGE_VARIANTS = {
  red: { bg: "bg-red-100", text: "text-red-800" },
  blue: { bg: "bg-blue-100", text: "text-blue-800" },
  green: { bg: "bg-green-100", text: "text-green-800" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
} as const;

type BadgeVariant = keyof typeof BADGE_VARIANTS;

export default function NewBadge({
  variant = "red",
  label = "New feature",
}: {
  variant?: BadgeVariant;
  label?: string;
}) {
  const { bg, text } = BADGE_VARIANTS[variant];
  return (
    <span
      aria-label={label}
      className={`animate-pulse text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}
    >
      New
    </span>
  );
}
