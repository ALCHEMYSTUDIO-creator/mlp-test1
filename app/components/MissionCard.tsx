type MissionCardProps = {
  completed: boolean;
  grandparentName: string;
};

export function MissionCard({ completed, grandparentName }: MissionCardProps) {
  return (
    <section className="rounded-3xl border border-[#e8dcc9] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#7d664f]">오늘의 미션</p>
      <h2 className="mt-1 text-2xl font-black">
        {grandparentName}께 짧은 안부 보내기
      </h2>
      <p className="mt-3 rounded-2xl bg-[#fff6e8] p-4 text-base font-semibold leading-7 text-[#68451e]">
        “오늘 저녁 잘 드셨어요? 저는 생각나서 연락드렸어요.”
      </p>
      <div className="mt-4 rounded-2xl bg-[#eef7e8] px-4 py-3 text-sm font-bold text-[#2f6f4e]">
        {completed ? "미션 완료됨" : "아직 오늘 미션을 기다리고 있어요"}
      </div>
    </section>
  );
}
