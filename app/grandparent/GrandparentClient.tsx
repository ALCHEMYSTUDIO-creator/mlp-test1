"use client";

import Link from "next/link";
import { useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";
import { addRecord, todayKey, useIlgramState } from "@/app/lib/ilgram-store";

const grandsonName = "지호";
const missionMessage = "할머니, 오늘 하늘이 예뻐서 생각났어요.";

function isTodayMissionCompleted(missionCompleted: boolean, lastMissionDate: string) {
  return missionCompleted && lastMissionDate === todayKey();
}

function getSimpleGardenStage(level: number) {
  if (level <= 1) {
    return "씨앗";
  }

  if (level <= 3) {
    return "새싹";
  }

  if (level <= 6) {
    return "나무";
  }

  return "꽃";
}

export default function GrandparentClient() {
  const { state, updateState } = useIlgramState();
  const [statusMessage, setStatusMessage] = useState("");
  const hasTodayHello = isTodayMissionCompleted(
    state.missionCompleted,
    state.lastMissionDate,
  );

  const sendThanks = () => {
    updateState((current) =>
      addRecord(current, {
        type: "thanks",
        message: "고맙다는 마음을 보냈어요.",
      }),
    );
    setStatusMessage("고맙다는 마음을 보냈어요.");
  };

  const sendVoice = () => {
    updateState((current) =>
      addRecord(current, {
        type: "voice",
        message: "음성 답장을 남겼어요.",
      }),
    );
    setStatusMessage("음성 답장을 남겼어요.");
  };

  const startPhoneFlow = () => {
    updateState((current) =>
      addRecord(current, {
        type: "phone",
        message: "전화 화면으로 연결되는 흐름입니다.",
      }),
    );
    setStatusMessage("전화 화면으로 연결되는 흐름입니다.");
  };

  return (
    <MobileFrame title="조부모 화면">
      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-6">
        <p className="text-lg font-semibold text-[#7d664f]">손주 안부</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight text-[#2c251f]">
          {hasTodayHello
            ? "오늘 손주가 안부를 보냈어요."
            : "아직 오늘 도착한 안부가 없어요."}
        </h2>
      </section>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-6">
        {hasTodayHello ? (
          <>
            <p className="text-xl font-bold text-[#2c251f]">
              {grandsonName}가 오늘 하늘 사진 미션을 완료했어요.
            </p>
            <SkyPhotoMock />
            <p className="mt-5 text-3xl font-bold leading-tight text-[#2c251f]">
              “{missionMessage}”
            </p>
          </>
        ) : (
          <p className="text-3xl font-bold leading-tight text-[#2c251f]">
            손주가 안부를 보내면 이곳에서 바로 볼 수 있어요.
          </p>
        )}
      </section>

      <section className="grid gap-3">
        <BigButton className="min-h-24 text-2xl" onClick={sendThanks}>
          고맙다고 보내기
        </BigButton>
        <BigButton
          className="min-h-24 text-2xl"
          onClick={sendVoice}
          variant="secondary"
        >
          음성으로 답장하기
        </BigButton>
        <BigButton
          className="min-h-24 text-2xl"
          onClick={startPhoneFlow}
          variant="soft"
        >
          손주에게 전화하기
        </BigButton>
      </section>

      {statusMessage ? (
        <section className="rounded-2xl border border-[#d5e2cf] bg-[#edf3e8] p-5">
          <p className="text-2xl font-bold leading-tight text-[#35533a]">
            {statusMessage}
          </p>
        </section>
      ) : null}

      <GrandparentGardenCard
        gardenLevel={state.gardenLevel}
        hasTodayHello={hasTodayHello}
        waterCount={state.waterCount}
      />

      <nav className="flex flex-wrap justify-center gap-5 pb-1 pt-2 text-sm font-bold text-[#6e563c]">
        <Link href="/">처음으로</Link>
        <Link href="/grandchild">손주 화면 보기</Link>
        <Link href="/grandparent-lockscreen">잠금화면 보기</Link>
        <Link href="/archive">가족 추억 보기</Link>
      </nav>
    </MobileFrame>
  );
}

function SkyPhotoMock() {
  return (
    <div className="relative mt-5 min-h-36 overflow-hidden rounded-2xl border border-[#d7e2e8] bg-[linear-gradient(180deg,#b9dced_0%,#dfeef1_58%,#f5dfbf_100%)] p-5">
      <div className="absolute right-8 top-7 h-12 w-12 rounded-full bg-[#f7d28a]/80" />
      <div className="absolute left-8 top-10 h-8 w-20 rounded-full bg-white/80" />
      <div className="absolute left-20 top-8 h-10 w-24 rounded-full bg-white/70" />
      <div className="absolute bottom-10 right-10 h-9 w-24 rounded-full bg-white/65" />
      <p className="relative text-lg font-semibold text-[#4c3a2b]">
        오늘의 하늘
      </p>
    </div>
  );
}

function GrandparentGardenCard({
  gardenLevel,
  waterCount,
  hasTodayHello,
}: {
  gardenLevel: number;
  waterCount: number;
  hasTodayHello: boolean;
}) {
  const stage = getSimpleGardenStage(gardenLevel);
  const plantCount = Math.min(4, Math.max(1, gardenLevel));

  return (
    <section className="rounded-2xl border border-[#e8dcc9] bg-white p-6">
      <p className="text-xl font-semibold text-[#7d664f]">가족 정원</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-[#2c251f]">{stage}</h2>
        <p className="rounded-full bg-[#edf3e8] px-4 py-2 text-lg font-bold text-[#35533a]">
          물 {waterCount}번
        </p>
      </div>

      <div className="mt-5 flex min-h-28 items-end justify-center gap-3 rounded-2xl bg-[#f6f0e4] p-5">
        {gardenLevel <= 1 ? (
          <div className="h-10 w-16 rounded-[50%] bg-[#8d6240]" />
        ) : (
          Array.from({ length: plantCount }).map((_, index) => (
            <div className="flex flex-col items-center" key={index}>
              <div
                className={`h-10 w-12 rounded-full rounded-br-sm ${
                  gardenLevel >= 7 ? "bg-[#ee8caf]" : "bg-[#73b66f]"
                }`}
              />
              <div
                className={`rounded-full bg-[#4f8b56] ${
                  gardenLevel >= 4 ? "h-20 w-5" : "h-12 w-4"
                }`}
              />
            </div>
          ))
        )}
      </div>

      <p className="mt-5 text-2xl font-bold leading-tight text-[#2c251f]">
        {hasTodayHello
          ? "오늘 정원이 조금 자랐어요."
          : "손주 안부가 오면 정원이 자라요."}
      </p>
    </section>
  );
}
