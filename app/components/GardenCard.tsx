type GardenCardProps = {
  gardenLevel: number;
  waterCount: number;
  message?: string;
  large?: boolean;
  showProgress?: boolean;
};

export function GardenCard({
  gardenLevel,
  waterCount,
  message,
  large = false,
  showProgress = false,
}: GardenCardProps) {
  const level = Math.max(0, gardenLevel);
  const progress = Math.min(100, Math.round((level / 7) * 100));
  const stage =
    level <= 1
      ? "씨앗"
      : level <= 3
        ? "새싹"
        : level <= 6
          ? "작은 나무"
          : "꽃핀 정원";
  const plantCount = Math.min(4, Math.max(1, level));

  return (
    <section className="rounded-2xl border border-[#e8dcc9] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7d664f]">가족 정원</p>
          <h2 className={`${large ? "text-3xl" : "text-xl"} font-bold`}>
            {stage}
          </h2>
        </div>
        <div className="rounded-full bg-[#edf3e8] px-3 py-1.5 text-sm font-semibold text-[#496b4f]">
          물 {waterCount}번
        </div>
      </div>

      <div className="mt-4 flex items-end justify-center gap-2 rounded-2xl bg-[#f7f1e8] px-4 py-5">
        {level <= 1 ? (
          <div
            className="h-8 w-12 rounded-[50%] bg-[#8d6240]"
            aria-hidden="true"
          />
        ) : null}
        {level > 1
          ? Array.from({ length: plantCount }).map((_, index) => (
              <div
                className="flex flex-col items-center"
                key={`sprout-${index}`}
                aria-hidden="true"
              >
                <div
                  className={`h-6 w-8 rounded-full rounded-br-sm ${
                    level >= 7 ? "bg-[#d98a8a]" : "bg-[#7da37a]"
                  }`}
                />
                <div
                  className={`rounded-full bg-[#5f7f5e] ${
                    level >= 4 ? "h-12 w-3" : "h-8 w-2.5"
                  }`}
                />
              </div>
            ))
          : null}
      </div>

      {showProgress ? (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-[#7d664f]">
            <span>성장</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eadfce]">
            <div
              className="h-full rounded-full bg-[#496b4f] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <p className={`${large ? "text-xl" : "text-sm"} mt-3 font-semibold text-[#5f5144]`}>
        {message ?? "정원이 조금씩 자라고 있어요."}
      </p>
      {showProgress ? (
        <p className="mt-2 text-sm font-semibold text-[#7d664f]">
          {stage === "씨앗" ? "내일도 이어가볼까요?" : `${stage} 단계예요.`}
        </p>
      ) : null}
    </section>
  );
}
