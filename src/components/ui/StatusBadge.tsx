interface StatusBadgeProps {
  status: "Approved" | "Pending" | "In Review" | "Rejected" | "Active" | "Expired" | "Revoked";
}

const statusStyles = {
  Approved: "bg-green-100 text-green-800 border-green-200",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Review": "bg-blue-100 text-blue-800 border-blue-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Active: "bg-green-100 text-green-800 border-green-200",
  Expired: "bg-gray-100 text-gray-800 border-gray-200",
  Revoked: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-bold border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
