"use client";

import Link from "next/link";
import { useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";
import { addRecord, useIlgramState } from "@/app/lib/ilgram-store";

export default function GrandparentLockscreenClient() {
  const { state, updateState } = useIlgramState();
  const [statusMessage, setStatusMessage] = useState("");
  const gardenMessage =
    state.waterCount > 0
      ? "오늘 가족 정원이 자랐어요."
      : "손주의 안부가 오면 정원이 자라요.";

  const sendThanks = () => {
    updateState((current) =>
      addRecord(current, {
        type: "thanks",
        message: "잠금화면에서 고맙다고 보냈어요.",
      }),
    );
    setStatusMessage("고맙다는 마음을 보냈어요.");
  };

  const sendVoice = () => {
    updateState((current) =>
      addRecord(current, {
        type: "voice",
        message: "잠금화면에서 음성 답장을 남겼어요.",
      }),
    );
    setStatusMessage("음성 답장을 남겼어요.");
  };

  return (
    <MobileFrame title="조부모 잠금화면">
      <section className="rounded-2xl border border-[#d8c9b6] bg-[#f7f1e8] p-5">
        <div className="text-center">
          <p className="text-6xl font-bold leading-none text-[#2c251f]">
            7:40
          </p>
          <p className="mt-2 text-base font-semibold text-[#6e563c]">
            5월 19일 화요일
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-[#e8dcc9] bg-white p-5">
          <p className="text-sm font-semibold text-[#7d664f]">일그람</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-[#2c251f]">
            지호가 안부를 보냈어요.
          </h2>
          <p className="mt-3 text-lg font-semibold leading-7 text-[#5f5144]">
            오늘의 하늘 사진이 도착했어요.
          </p>
          <p className="mt-1 text-lg font-semibold leading-7 text-[#5f5144]">
            버튼을 누르면 바로 볼 수 있어요.
          </p>

          <SkyPreview />
        </section>
      </section>

      <section className="grid gap-3">
        <BigButton className="min-h-20 text-2xl" href="/grandparent">
          사진 보기
        </BigButton>
        <BigButton
          className="min-h-20 text-2xl"
          onClick={sendThanks}
          variant="secondary"
        >
          고맙다고 보내기
        </BigButton>
        <BigButton
          className="min-h-20 text-2xl"
          onClick={sendVoice}
          variant="soft"
        >
          음성으로 답장하기
        </BigButton>
      </section>

      {statusMessage ? (
        <section className="rounded-2xl border border-[#d5e2cf] bg-[#edf3e8] p-4">
          <p className="text-xl font-bold leading-tight text-[#35533a]">
            {statusMessage}
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-4">
        <p className="text-sm font-semibold text-[#7d664f]">가족 정원</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-lg font-bold leading-7 text-[#2c251f]">
            {gardenMessage}
          </p>
          <p className="shrink-0 rounded-full bg-[#edf3e8] px-3 py-1.5 text-sm font-bold text-[#35533a]">
            물 {state.waterCount}번
          </p>
        </div>
      </section>

      <p className="px-2 text-center text-xs font-semibold leading-5 text-[#7d664f]">
        실제 OS 잠금화면 기능이 아닌 MVP 검증용 시뮬레이션입니다.
      </p>

      <nav className="flex flex-wrap justify-center gap-5 pb-1 text-sm font-bold text-[#6e563c]">
        <Link href="/grandparent">조부모 화면</Link>
        <Link href="/archive">사진·음성 기록하기</Link>
        <Link href="/">처음으로</Link>
      </nav>
    </MobileFrame>
  );
}

function SkyPreview() {
  return (
    <div className="relative mt-5 min-h-32 overflow-hidden rounded-2xl border border-[#d7e2e8] bg-[linear-gradient(180deg,#b9dced_0%,#dfeef1_58%,#f5dfbf_100%)] p-4">
      <div className="absolute right-8 top-6 h-11 w-11 rounded-full bg-[#f7d28a]/80" />
      <div className="absolute left-7 top-10 h-7 w-20 rounded-full bg-white/80" />
      <div className="absolute left-16 top-8 h-9 w-24 rounded-full bg-white/70" />
      <div className="absolute bottom-8 right-10 h-8 w-24 rounded-full bg-white/65" />
      <p className="relative text-base font-semibold text-[#4c3a2b]">
        오늘의 하늘
      </p>
    </div>
  );
}
