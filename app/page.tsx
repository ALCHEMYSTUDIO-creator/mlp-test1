import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";

export default function Home() {
  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col justify-center gap-8">
        <section className="space-y-4">
          <p className="text-sm font-bold text-[#8b735b]">2차 MVP 프로토타입</p>
          <h1 className="text-5xl font-bold tracking-normal text-[#2c251f]">
            일그람
          </h1>
          <p className="text-lg font-semibold leading-8 text-[#5f5144]">
            작은 미션으로 조부모와 손주의 연락을 돕는 가족 정원 서비스
          </p>
        </section>

        <section className="rounded-2xl border border-[#e8dcc9] bg-white p-5">
          <p className="text-sm font-semibold text-[#7d664f]">
            추천 체험 순서
          </p>
          <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#5f5144]">
            <li>1. 잠금화면 알림을 열어보세요.</li>
            <li>2. 손주 화면에서 오늘의 미션을 완료해보세요.</li>
            <li>3. 정원에 물을 주세요.</li>
            <li>4. 조부모 화면에서 안부가 어떻게 보이는지 확인해보세요.</li>
            <li>5. 가족 추억을 기록해보세요.</li>
          </ol>
        </section>

        <section className="grid gap-3">
          <BigButton href="/demo-lockscreen">잠금화면 알림 체험하기</BigButton>
          <BigButton href="/grandchild" variant="secondary">
            손주로 체험하기
          </BigButton>
          <BigButton href="/grandparent" variant="secondary">
            조부모로 체험하기
          </BigButton>
        </section>
      </div>
    </MobileFrame>
  );
}
