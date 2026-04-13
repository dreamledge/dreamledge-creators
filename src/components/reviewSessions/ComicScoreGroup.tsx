import { reviewCategories } from "@/lib/constants/reviewSessions";
import type { ReviewCategory, ReviewScoreLabel, ReviewScores } from "@/types/models";

const options: { label: string; value: ReviewScoreLabel }[] = [
  { label: "Trash!", value: "trash" },
  { label: "OK!", value: "ok" },
  { label: "Fire!", value: "fire" },
];

export function ComicScoreGroup({
  category,
  value,
  onChange,
  disabled = false,
  sessionId,
}: {
  category: ReviewCategory;
  value: ReviewScoreLabel | null;
  onChange: (value: ReviewScoreLabel) => void;
  disabled?: boolean;
  sessionId: string;
}) {
  const title = reviewCategories.find((item) => item.key === category)?.label ?? category;

  return (
    <div className="score-category">
      <p className="score-title">{title}</p>
      <div className={`comic-radio-group ${disabled ? "pointer-events-none opacity-55" : ""}`}>
        {options.map((option) => {
          const id = `${sessionId}-${category}-${option.value}`;
          return (
            <div key={id} className="contents">
              <input
                type="radio"
                name={`${sessionId}-${category}`}
                id={id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={disabled}
              />
              <label htmlFor={id}>{option.label}</label>
            </div>
          );
        })}
        <div className={`comic-glider ${value ? `is-${value}` : ""}`} />
      </div>
    </div>
  );
}

export function ReviewScoreGroups({
  scores,
  onChange,
  disabled,
  sessionId,
}: {
  scores: ReviewScores;
  onChange: (category: ReviewCategory, value: ReviewScoreLabel) => void;
  disabled?: boolean;
  sessionId: string;
}) {
  return (
    <div className="space-y-4">
      {reviewCategories.map((category) => (
        <ComicScoreGroup
          key={category.key}
          category={category.key}
          value={scores[category.key]}
          onChange={(value) => onChange(category.key, value)}
          disabled={disabled}
          sessionId={sessionId}
        />
      ))}
    </div>
  );
}
