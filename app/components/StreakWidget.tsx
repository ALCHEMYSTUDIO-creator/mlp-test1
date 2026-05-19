type StreakWidgetProps = {
  streak: number;
  wateredToday?: boolean;
  weeklyWaterCount?: number;
};

export function StreakWidget({
  streak,
  wateredToday = false,
  weeklyWaterCount = 0,
}: StreakWidgetProps) {
  return (
    <section className="flex items-center justify-between gap-3">
      <p className="text-base font-semibold text-[#5f5144]">
        오늘도 짧게 안부를 전해보세요.
      </p>
      <div className="shrink-0 rounded-full border border-[#d8c9b6] bg-white px-3 py-2 text-sm font-bold text-[#496b4f]">
        {streak}일째 이어가는 중
      </div>
      <span className="sr-only">
        {wateredToday
          ? `오늘 완료, 이번 주 ${weeklyWaterCount}번 물 주기`
          : `오늘 미완료, 이번 주 ${weeklyWaterCount}번 물 주기`}
      </span>
    </section>
  );
}
