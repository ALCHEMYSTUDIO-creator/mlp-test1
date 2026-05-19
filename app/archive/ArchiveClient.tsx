"use client";

import Link from "next/link";
import { useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";
import { type ArchiveItem, useArchiveStore } from "@/app/lib/archive-store";
import { useIlgramState } from "@/app/lib/ilgram-store";

export default function ArchiveClient() {
  const { state } = useIlgramState();
  const { items, addArchiveItem, deleteArchiveItem } = useArchiveStore();
  const [missionTitle, setMissionTitle] = useState("오늘의 하늘");
  const [message, setMessage] = useState(
    "할머니, 오늘 하늘이 예뻐서 생각났어요.",
  );
  const [grandparentReply, setGrandparentReply] =
    useState("사진 보내줘서 좋다.");
  const [hasImagePreview, setHasImagePreview] = useState(false);
  const [voiceNoteLabel, setVoiceNoteLabel] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const saveArchiveItem = () => {
    addArchiveItem({
      missionTitle,
      senderRole: "grandchild",
      message,
      grandparentReply,
      imagePreview: hasImagePreview ? "sky" : undefined,
      voiceNoteLabel: voiceNoteLabel || undefined,
      gardenLevelAtThatTime: state.gardenLevel,
      waterCountAtThatTime: state.waterCount,
    });
    setStatusMessage("추억 카드가 저장됐어요.");
  };

  return (
    <MobileFrame title="가족 추억 기록">
      <section>
        <h2 className="text-3xl font-bold leading-tight text-[#2c251f]">
          가족 추억 기록
        </h2>
        <p className="mt-2 text-base font-semibold text-[#5f5144]">
          사진 한 장과 목소리 한마디를 기록해요.
        </p>
      </section>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-5">
        <p className="text-sm font-semibold text-[#7d664f]">
          오늘의 추억 남기기
        </p>
        <p className="mt-1 text-sm font-medium text-[#7d664f]">
          사진과 음성은 MVP용 mock으로 저장됩니다.
        </p>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[#5f5144]">미션 제목</span>
          <input
            className="mt-2 w-full rounded-xl border border-[#e4d6c2] bg-[#fffaf2] px-4 py-3 text-base font-semibold outline-none focus:border-[#496b4f]"
            onChange={(event) => setMissionTitle(event.target.value)}
            value={missionTitle}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[#5f5144]">
            손주가 보낸 말
          </span>
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#e4d6c2] bg-[#fffaf2] px-4 py-3 text-base font-semibold leading-7 outline-none focus:border-[#496b4f]"
            onChange={(event) => setMessage(event.target.value)}
            value={message}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[#5f5144]">
            조부모 반응
          </span>
          <input
            className="mt-2 w-full rounded-xl border border-[#e4d6c2] bg-[#fffaf2] px-4 py-3 text-base font-semibold outline-none focus:border-[#496b4f]"
            onChange={(event) => setGrandparentReply(event.target.value)}
            value={grandparentReply}
          />
        </label>

        {hasImagePreview ? <SkyPhotoMock /> : null}

        <div className="mt-4 grid gap-2">
          <button
            className="rounded-xl border border-[#d5e2cf] bg-[#edf3e8] px-4 py-3 text-sm font-bold text-[#35533a]"
            onClick={() => setHasImagePreview(true)}
            type="button"
          >
            하늘 사진 추가
          </button>
          <button
            className="rounded-xl border border-[#e4d6c2] bg-white px-4 py-3 text-sm font-bold text-[#5f5144]"
            onClick={() => setVoiceNoteLabel("음성 메시지 12초")}
            type="button"
          >
            음성 메시지 추가
          </button>
        </div>

        {voiceNoteLabel ? (
          <p className="mt-3 rounded-xl bg-[#f7f1e8] px-4 py-3 text-sm font-semibold text-[#5f5144]">
            {voiceNoteLabel}
          </p>
        ) : null}

        <BigButton className="mt-4" onClick={saveArchiveItem}>
          추억 카드 저장하기
        </BigButton>

        {statusMessage ? (
          <p className="mt-3 rounded-xl bg-[#edf3e8] px-4 py-3 text-sm font-semibold text-[#496b4f]">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#e8dcc9] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#7d664f]">저장된 추억</p>
          <p className="text-sm font-semibold text-[#496b4f]">{items.length}개</p>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#fffaf2] p-4">
            <p className="text-lg font-bold text-[#2c251f]">
              아직 저장된 추억이 없어요.
            </p>
            <p className="mt-2 text-sm font-semibold text-[#5f5144]">
              오늘의 사진과 목소리를 남겨보세요.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <ArchiveCard
                item={item}
                key={item.id}
                onDelete={() => deleteArchiveItem(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      <nav className="flex flex-wrap justify-center gap-5 pb-1 text-sm font-bold text-[#6e563c]">
        <Link href="/grandchild">손주 화면</Link>
        <Link href="/grandparent">조부모 화면</Link>
        <Link href="/">처음으로</Link>
      </nav>
    </MobileFrame>
  );
}

function ArchiveCard({
  item,
  onDelete,
}: {
  item: ArchiveItem;
  onDelete: () => void;
}) {
  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(new Date(item.date));

  return (
    <article className="rounded-2xl border border-[#e8dcc9] bg-[#fffaf2] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#7d664f]">{date}</p>
          <h3 className="mt-1 text-xl font-bold text-[#2c251f]">
            {item.missionTitle}
          </h3>
        </div>
        <button
          className="rounded-full border border-[#e4d6c2] bg-white px-3 py-1 text-xs font-semibold text-[#7d664f]"
          onClick={onDelete}
          type="button"
        >
          삭제
        </button>
      </div>

      {item.imagePreview ? <SkyPhotoMock compact /> : null}

      <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#5f5144]">
        <p>손주: {item.message}</p>
        <p>조부모: {item.grandparentReply}</p>
        {item.voiceNoteLabel ? <p>{item.voiceNoteLabel}</p> : null}
        <p>
          당시 정원: Lv. {item.gardenLevelAtThatTime ?? 0} · 물{" "}
          {item.waterCountAtThatTime ?? 0}번
        </p>
      </div>
    </article>
  );
}

function SkyPhotoMock({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative mt-4 overflow-hidden rounded-2xl border border-[#d7e2e8] bg-[linear-gradient(180deg,#b9dced_0%,#dfeef1_58%,#f5dfbf_100%)] p-4 ${
        compact ? "min-h-24" : "min-h-32"
      }`}
    >
      <div className="absolute right-8 top-6 h-10 w-10 rounded-full bg-[#f7d28a]/80" />
      <div className="absolute left-7 top-10 h-7 w-20 rounded-full bg-white/80" />
      <div className="absolute left-16 top-8 h-9 w-24 rounded-full bg-white/70" />
      <p className="relative text-sm font-semibold text-[#4c3a2b]">
        오늘의 하늘
      </p>
    </div>
  );
}
