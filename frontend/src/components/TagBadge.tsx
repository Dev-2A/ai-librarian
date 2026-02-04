import { X } from "lucide-react";

interface Props {
  tag: string;
  onRemove?: () => void;
}

export default function TagBadge({ tag, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-primary-900 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
