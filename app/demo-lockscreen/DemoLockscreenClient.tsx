"use client";

import Link from "next/link";
import { useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";
import { todayKey, useIlgramState } from "@/app/lib/ilgram-store";

type Mode = "ios" | "android";

function isMissionDoneToday(missionCompleted: boolean, lastMissionDate: string) {
  return missionCompleted && lastMissionDate === todayKey();
}

export default function DemoLockscreenClient() {
  const [mode, setMode] = useState<Mode>("ios");
  const { state } = useIlgramState();
  const missionDoneToday = isMissionDoneToday(
    state.missionCompleted,
    state.lastMissionDate,
  );

  return (
    <MobileFrame title="알림 체험">
      <section className="grid grid-cols-2 gap-2 rounded-xl bg-[#efe3d2] p-1">
        <button
          aria-pressed={mode === "ios"}
          className={`min-h-12 rounded-lg px-4 py-3 text-sm font-bold transition ${
            mode === "ios"
              ? "bg-white text-[#2c251f] shadow-sm"
              : "text-[#735d47]"
          }`}
          onClick={() => setMode("ios")}
          type="button"
        >
          iOS
        </button>
        <button
          aria-pressed={mode === "android"}
          className={`min-h-12 rounded-lg px-4 py-3 text-sm font-bold transition ${
            mode === "android"
              ? "bg-white text-[#2c251f] shadow-sm"
              : "text-[#735d47]"
          }`}
          onClick={() => setMode("android")}
          type="button"
        >
          Android
        </button>
      </section>

      {mode === "ios" ? (
        <IosSimulation />
      ) : (
        <AndroidSimulation missionDoneToday={missionDoneToday} />
      )}

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-4">
        <p className="text-sm font-bold leading-6 text-[#6e563c]">
          실제 OS 기능이 아닌 MVP 시뮬레이션입니다.
        </p>
      </section>

      <nav className="flex flex-wrap justify-center gap-5 pb-1 text-sm font-bold text-[#6e563c]">
        <Link href="/">처음으로</Link>
        <Link href="/grandchild">손주 화면</Link>
        <Link href="/grandparent-lockscreen">조부모 잠금화면 보기</Link>
      </nav>
    </MobileFrame>
  );
}

function IosSimulation() {
  return (
    <>
      <section className="rounded-2xl border border-[#d8c9b6] bg-[#f7f1e8] p-5">
        <p className="text-sm font-semibold text-[#7d664f]">iOS mock</p>
        <Link
          className="mt-4 block rounded-2xl border border-[#e8dcc9] bg-white p-5 text-[#2c251f]"
          href="/grandchild"
        >
          <p className="text-sm font-semibold text-[#7d664f]">일그람 알림</p>
          <h2 className="mt-2 text-xl font-bold leading-tight">
            지금은 할머니께 짧게 연락드리기 좋은 시간이에요.
          </h2>
          <p className="mt-3 text-base font-semibold leading-7 text-[#5f5144]">
            사진 한 장 보내고 가족 정원에 물을 줘볼까요?
          </p>
        </Link>
        <div className="mt-3 rounded-2xl border border-[#e8dcc9] bg-white/70 p-4">
          <p className="text-sm font-semibold text-[#496b4f]">작은 위젯</p>
          <p className="mt-1 text-base font-bold text-[#2c251f]">하늘 사진 보내기</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-5">
        <p className="text-base font-bold leading-7 text-[#5f5144]">
          iOS는 알림과 위젯 진입을 가정합니다.
        </p>
        <BigButton href="/grandchild" className="mt-4">
          알림 열기
        </BigButton>
      </section>
    </>
  );
}

function AndroidSimulation({
  missionDoneToday,
}: {
  missionDoneToday: boolean;
}) {
  return (
    <>
      <section className="rounded-2xl border border-[#d8c9b6] bg-[#f7f1e8] p-5">
        <p className="text-sm font-semibold text-[#7d664f]">Android mock</p>
        <Link
          className="mt-4 block rounded-2xl border border-[#e8dcc9] bg-white p-5 text-[#2c251f]"
          href="/grandchild"
        >
          <p className="text-sm font-semibold text-[#7d664f]">일그람 알림</p>
          <h2 className="mt-2 text-xl font-bold leading-tight">
            지금은 할머니께 짧게 연락드리기 좋은 시간이에요.
          </h2>
          <p className="mt-3 text-base font-semibold leading-7 text-[#5f5144]">
            사진 한 장 보내고 가족 정원에 물을 줘볼까요?
          </p>
        </Link>

        <section className="mt-3 rounded-2xl border border-[#d5e2cf] bg-white p-4 text-[#20351e]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#496b4f]">위젯</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight">
                {missionDoneToday ? (
                  "오늘 완료"
                ) : (
                  <>
                    아직 오늘의
                    <br />물을 주지 않았어요.
                  </>
                )}
              </h2>
              <p className="mt-3 text-lg font-bold leading-7 text-[#3e5f36]">
                {missionDoneToday
                  ? "정원이 조금 자랐어요."
                  : "미션에서 바로 이어갈 수 있어요."}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-end justify-center rounded-2xl bg-[#edf3e8] p-3">
              <div className="h-12 w-4 rounded-full bg-[#4f8b56]" />
              <div className="mb-7 h-7 w-8 rounded-full rounded-br-sm bg-[#73b66f]" />
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-5">
        <p className="text-base font-bold leading-7 text-[#5f5144]">
          Android는 위젯과 알림 진입을 가정합니다.
        </p>
        <BigButton href="/grandchild" className="mt-4">
          미션 바로 하기
        </BigButton>
      </section>
    </>
  );
}
