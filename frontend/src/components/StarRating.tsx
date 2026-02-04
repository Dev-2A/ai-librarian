import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
}: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!readonly && onChange) {
                // 같은 별 클릭 시 0.5 단위 토글
                onChange(value === star ? star - 0.5 : star);
              }
            }}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform`}
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-warm-500 text-warm-500"
                  : half
                    ? "fill-warm-200 text-warm-500"
                    : "fill-none text-gray-300"
              }
            />
          </button>
        );
      })}
      <span className="ml-1.5 text-sm text-gray-500 tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
