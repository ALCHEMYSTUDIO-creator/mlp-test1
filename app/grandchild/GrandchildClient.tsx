"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { GardenCard } from "@/app/components/GardenCard";
import { MobileFrame } from "@/app/components/MobileFrame";
import { StreakWidget } from "@/app/components/StreakWidget";
import {
  addRecord,
  type ContextSettings,
  todayKey,
  useIlgramState,
} from "@/app/lib/ilgram-store";

const missionTitle = "하늘 사진 보내기";
const recommendedText = "할머니, 오늘 하늘이 예뻐서 생각났어요.";
const userTimes = ["점심시간", "저녁", "자기 전", "주말"];
const grandparentTimes = ["오전", "오후", "저녁"];
const preferredMissions = ["사진", "짧은 문자", "음성", "질문"];

function getNotificationCopy(settings: ContextSettings) {
  const name = settings.grandparentName || "할머니";
  const goodTime = settings.userContactTime || settings.goodTime;

  if (settings.preferredMission === "음성") {
    return {
      title: `지금은 ${name}께 짧게 연락드리기 좋은 시간이에요.`,
      body: "짧은 음성 한마디로 안부를 남겨볼까요?",
    };
  }

  if (goodTime === "저녁" || settings.goodTime.includes("저녁")) {
    return {
      title: `오늘 저녁, ${name}께 짧은 안부를 전하기 좋은 시간이에요.`,
      body: "사진 한 장 보내고 가족 정원에 물을 줘볼까요?",
    };
  }

  return {
    title: `지금은 ${name}께 짧게 연락드리기 좋은 시간이에요.`,
    body: "사진 한 장 보내고 가족 정원에 물을 줘볼까요?",
  };
}

function sameDay(value: string) {
  return value.slice(0, 10) === todayKey();
}

function withinLastSevenDays(value: string) {
  const createdAt = new Date(value).getTime();
  return (
    Number.isFinite(createdAt) && Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000
  );
}

export default function GrandchildClient() {
  const { state, updateState } = useIlgramState();
  const [copyStatus, setCopyStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [draftContext, setDraftContext] = useState<Partial<ContextSettings>>({});
  const contextDraft = { ...state.contextSettings, ...draftContext };

  const notification = useMemo(
    () => getNotificationCopy(state.contextSettings),
    [state.contextSettings],
  );

  const wateredToday = state.records.some(
    (record) => record.type === "water" && sameDay(record.createdAt),
  );
  const missionCompletedToday =
    state.missionCompleted && state.lastMissionDate === todayKey();
  const weeklyRecords = state.records.filter((record) =>
    withinLastSevenDays(record.createdAt),
  );
  const weeklyWaterCount = weeklyRecords.filter(
    (record) => record.type === "water",
  ).length;
  const weeklyMissionCount = weeklyRecords.filter(
    (record) => record.type === "mission",
  ).length;
  const latestThanks = state.records.find((record) => record.type === "thanks");

  const copyRecommendedText = async () => {
    try {
      await navigator.clipboard.writeText(recommendedText);
      setCopyStatus("문구가 복사됐어요");
      setActionStatus("");
    } catch {
      setCopyStatus("복사 권한이 없어 문구를 직접 선택해 주세요");
      setActionStatus("");
    }
  };

  const checkKakaoSent = () => {
    updateState((current) => {
      const alreadyCompletedToday =
        current.missionCompleted && current.lastMissionDate === todayKey();

      if (alreadyCompletedToday) {
        return current;
      }

      return addRecord(
        {
          ...current,
          missionCompleted: true,
          lastMissionDate: todayKey(),
        },
        {
          type: "mission",
          message: "하늘 사진 미션을 카톡으로 보냈어요.",
        },
      );
    });
    setActionStatus("오늘도 마음을 보냈어요.");
  };

  const waterGarden = () => {
    updateState((current) =>
      addRecord(
        {
          ...current,
          waterCount: current.waterCount + 1,
          gardenLevel: current.gardenLevel + 1,
          streak: current.streak + 1,
        },
        {
          type: "water",
          message: "오늘도 가족 정원에 물을 줬어요.",
        },
      ),
    );
    setActionStatus("정원이 조금 자랐어요.");
  };

  const resetGarden = () => {
    updateState((current) => ({
      ...current,
      waterCount: 0,
      gardenLevel: 0,
      streak: 0,
    }));
    setActionStatus("정원이 처음 상태로 돌아갔어요.");
  };

  const saveContext = () => {
    updateState((current) => ({
      ...current,
      contextSettings: {
        ...current.contextSettings,
        ...contextDraft,
        goodTime: contextDraft.userContactTime,
      },
    }));
    setActionStatus("내 맥락을 저장했어요");
  };

  return (
    <MobileFrame title="손주 화면">
      <StreakWidget
        streak={state.streak}
        wateredToday={wateredToday}
        weeklyWaterCount={weeklyWaterCount}
      />

      <section
        className={`rounded-2xl border p-5 ${
          wateredToday
            ? "border-[#cfe2c4] bg-[#f7fbf4]"
            : "border-[#e4d6c2] bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#7d664f]">오늘의 미션</p>
            <h2 className="mt-1 text-3xl font-bold leading-tight">
              {missionTitle}
            </h2>
            <p className="mt-2 text-base font-semibold leading-7 text-[#5f5144]">
              사진 한 장으로 안부를 시작해보세요.
            </p>
          </div>
          <div
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${
              wateredToday
                ? "bg-[#edf3e8] text-[#496b4f]"
                : "bg-[#fff1d9] text-[#8a6332]"
            }`}
          >
            {wateredToday ? "완료" : "미완료"}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#fff8ed] px-4 py-3">
          <p className="text-sm font-semibold text-[#7d664f]">
            {missionCompletedToday
              ? "오늘 미션 완료. 이제 정원에 물을 줄 수 있어요."
              : "사진 한 장이면 충분해요."}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#efe3d2] bg-[#fffaf2] p-4">
          <p className="text-xs font-semibold text-[#8a6332]">추천 문구</p>
          <p className="mt-2 text-lg font-bold leading-8 text-[#4c3a2b]">
            “{recommendedText}”
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-[#f3f6ef] px-4 py-3">
          <p className="text-sm font-semibold text-[#496b4f]">
            {notification.title}
          </p>
          <p className="mt-1 text-sm font-medium text-[#5f5144]">
            {notification.body}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          <BigButton onClick={checkKakaoSent}>
            보냈어요
          </BigButton>
          <BigButton onClick={copyRecommendedText} variant="secondary">
            문구 복사
          </BigButton>
          {missionCompletedToday ? (
            <BigButton onClick={waterGarden} variant="soft">
              정원에 물 주기
            </BigButton>
          ) : null}
        </div>

        {copyStatus || actionStatus ? (
          <p className="mt-4 rounded-xl bg-[#edf3e8] px-4 py-3 text-sm font-semibold text-[#496b4f]">
            {actionStatus || copyStatus}
          </p>
        ) : null}
      </section>

      <GardenCard
        gardenLevel={state.gardenLevel}
        waterCount={state.waterCount}
        message={
          wateredToday
            ? "정원이 조금 자랐어요."
            : "내일도 이어가볼까요?"
        }
        showProgress
      />
      <button
        className="-mt-2 self-end rounded-full border border-[#e4d6c2] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#7d664f]"
        onClick={resetGarden}
        type="button"
      >
        정원 초기화
      </button>

      <details className="rounded-2xl border border-[#e8dcc9] bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#5f5144]">
          맥락 설정 바꾸기
        </summary>
        <div className="mt-4 grid gap-4">
          <SegmentedControl
            label="내가 연락하기 편한 시간"
            options={userTimes}
            value={contextDraft.userContactTime}
            onChange={(value) =>
              setDraftContext((current) => ({
                ...current,
                userContactTime: value,
              }))
            }
          />
          <SegmentedControl
            label="조부모님께 연락드리기 좋은 시간"
            options={grandparentTimes}
            value={contextDraft.grandparentContactTime}
            onChange={(value) =>
              setDraftContext((current) => ({
                ...current,
                grandparentContactTime: value,
              }))
            }
          />
          <SegmentedControl
            label="선호 미션"
            options={preferredMissions}
            value={contextDraft.preferredMission}
            onChange={(value) =>
              setDraftContext((current) => ({
                ...current,
                preferredMission: value,
              }))
            }
          />
        </div>
        <BigButton className="mt-5" onClick={saveContext} variant="secondary">
          내 맥락 저장하기
        </BigButton>
      </details>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#7d664f]">
            이번 주 기록 {weeklyWaterCount + weeklyMissionCount}개
          </p>
          <Link className="text-sm font-semibold text-[#496b4f]" href="/archive">
            가족 추억 보기
          </Link>
        </div>
        <p className="mt-2 text-sm font-medium text-[#5f5144]">
          {latestThanks
            ? "할머니가 고맙다고 답장했어요."
            : "하늘 사진 미션을 기록하고 있어요."}
        </p>
      </section>
    </MobileFrame>
  );
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-black text-[#5f5144]">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              value === option
                ? "border-[#496b4f] bg-[#edf3e8] text-[#35533a]"
                : "border-[#e8dcc9] bg-[#fffaf2] text-[#6e563c]"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
