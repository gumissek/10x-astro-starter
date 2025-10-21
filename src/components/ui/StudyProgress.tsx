interface StudyProgressProps {
  current: number;
  total: number;
}

export default function StudyProgress({ current, total }: StudyProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Postęp</span>
        <span>
          {current}/{total}
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>

      <div className="text-center text-xs text-muted-foreground">{Math.round(percentage)}% ukończone</div>
    </div>
  );
}
