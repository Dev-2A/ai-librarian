import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = "불러오는 중..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 size={32} className="animate-spin mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
