"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BigButton } from "@/app/components/BigButton";
import { MobileFrame } from "@/app/components/MobileFrame";
import { type ArchiveItem, useArchiveStore } from "@/app/lib/archive-store";
import { useIlgramState } from "@/app/lib/ilgram-store";
import { getLocalMedia, saveLocalMedia } from "@/app/lib/local-media-store";

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
  const [selectedImage, setSelectedImage] = useState<Blob | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [voiceNoteLabel, setVoiceNoteLabel] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFallbackMessage, setRecordingFallbackMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const imageObjectUrlRef = useRef("");
  const voiceObjectUrlRef = useRef("");
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerFrameRef = useRef<number | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const cleanupRecordingResources = () => {
    if (visualizerFrameRef.current !== null) {
      cancelAnimationFrame(visualizerFrameRef.current);
      visualizerFrameRef.current = null;
    }

    activeStreamRef.current?.getTracks().forEach((track) => track.stop());
    activeStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const drawVoiceVisualizer = () => {
    const canvas = visualizerCanvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) {
      visualizerFrameRef.current = requestAnimationFrame(drawVoiceVisualizer);
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 20;
    const gap = 5;
    const barWidth = (canvas.width - gap * (barCount - 1)) / barCount;

    for (let index = 0; index < barCount; index += 1) {
      const dataIndex = Math.floor((index / barCount) * data.length);
      const value = data[dataIndex] ?? 0;
      const height = Math.max(6, (value / 255) * (canvas.height - 12));
      const x = index * (barWidth + gap);
      const y = canvas.height - height;

      context.fillStyle = "#496b4f";
      drawRoundedBar(context, x, y, barWidth, height, 6);
    }

    visualizerFrameRef.current = requestAnimationFrame(drawVoiceVisualizer);
  };

  const startVoiceVisualizer = (stream: MediaStream) => {
    const windowWithAudio = window as Window &
      typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioContextConstructor =
      windowWithAudio.AudioContext ?? windowWithAudio.webkitAudioContext;

    if (!AudioContextConstructor) {
      throw new Error("AudioContext is not available");
    }

    const audioContext = new AudioContextConstructor();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 64;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    drawVoiceVisualizer();
  };

  const saveArchiveItem = async () => {
    const localImageId = selectedImage ? createLocalMediaId("image") : undefined;
    const localVoiceId = voiceBlob ? createLocalMediaId("voice") : undefined;

    try {
      if (selectedImage && localImageId) {
        await saveLocalMedia(localImageId, selectedImage);
      }
      if (voiceBlob && localVoiceId) {
        await saveLocalMedia(localVoiceId, voiceBlob);
      }
    } catch {
      setStatusMessage("미디어는 mock으로 표시돼요.");
    }

    addArchiveItem({
      missionTitle,
      senderRole: "grandchild",
      message,
      grandparentReply,
      imagePreview: hasImagePreview || selectedImage ? "sky" : undefined,
      voiceNoteLabel: voiceNoteLabel || undefined,
      hasLocalImage: Boolean(selectedImage || hasImagePreview),
      hasLocalVoice: Boolean(voiceBlob || voiceNoteLabel),
      localImageId,
      localVoiceId,
      voiceDurationLabel: voiceNoteLabel || undefined,
      localOnly: true,
      gardenLevelAtThatTime: state.gardenLevel,
      waterCountAtThatTime: state.waterCount,
    });
    setStatusMessage(
      "보낸 기기에 기록됐어요. 상대에게 실제 전송되지는 않는 MVP 시뮬레이션입니다.",
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    imageObjectUrlRef.current = objectUrl;
    setSelectedImage(file);
    setSelectedImageUrl(objectUrl);
    setHasImagePreview(true);
  };

  const addSkyMock = () => {
    setHasImagePreview(true);
    setSelectedImage(null);
    setSelectedImageUrl("");
  };

  const startRecording = async () => {
    setRecordingFallbackMessage("");

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !("MediaRecorder" in window) ||
      !("AudioContext" in window || "webkitAudioContext" in window)
    ) {
      setVoiceNoteLabel("음성 메시지 12초");
      setRecordingFallbackMessage(
        "이 기기에서는 실제 녹음 대신 음성메모 mock으로 저장돼요.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      activeStreamRef.current = stream;
      recordingChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      startVoiceVisualizer(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const seconds = Math.max(
          1,
          Math.round((Date.now() - recordingStartedAtRef.current) / 1000),
        );

        if (voiceObjectUrlRef.current) {
          URL.revokeObjectURL(voiceObjectUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(blob);
        voiceObjectUrlRef.current = objectUrl;
        setVoiceBlob(blob);
        setVoiceUrl(objectUrl);
        setVoiceNoteLabel(`음성 메시지 ${seconds}초`);
        setIsRecording(false);
        cleanupRecordingResources();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      cleanupRecordingResources();
      setVoiceNoteLabel("음성 메시지 12초");
      setRecordingFallbackMessage(
        "이 기기에서는 실제 녹음 대신 음성메모 mock으로 저장돼요.",
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      return;
    }

    cleanupRecordingResources();
  };

  const addMockVoice = () => {
    setVoiceNoteLabel("음성 메시지 12초");
    setRecordingFallbackMessage(
      "이 기기에서는 실제 녹음 대신 음성메모 mock으로 저장돼요.",
    );
  };

  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
      if (voiceObjectUrlRef.current) {
        URL.revokeObjectURL(voiceObjectUrlRef.current);
      }
      cleanupRecordingResources();
    };
  }, []);

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
        <p className="mt-1 text-xs font-semibold leading-5 text-[#7d664f]">
          이 MVP에서는 사진과 음성이 현재 기기 안에서만 저장됩니다. 실제
          상대방에게 전송되지는 않습니다.
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

        {selectedImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="선택한 사진 미리보기"
            className="mt-4 max-h-56 w-full rounded-2xl border border-[#d7e2e8] object-cover"
            src={selectedImageUrl}
          />
        ) : hasImagePreview ? (
          <SkyPhotoMock />
        ) : null}

        <div className="mt-4 grid gap-2">
          <label className="rounded-xl border border-[#d5e2cf] bg-[#edf3e8] px-4 py-3 text-center text-sm font-bold text-[#35533a]">
            사진 선택
            <input
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              type="file"
            />
          </label>
          <button
            className="rounded-xl border border-[#d5e2cf] bg-[#edf3e8] px-4 py-3 text-sm font-bold text-[#35533a]"
            onClick={addSkyMock}
            type="button"
          >
            하늘 사진 추가
          </button>
          <button
            className="rounded-xl border border-[#e4d6c2] bg-white px-4 py-3 text-sm font-bold text-[#5f5144]"
            disabled={isRecording}
            onClick={startRecording}
            type="button"
          >
            녹음 시작
          </button>
          <button
            className="rounded-xl border border-[#e4d6c2] bg-white px-4 py-3 text-sm font-bold text-[#5f5144] disabled:opacity-50"
            disabled={!isRecording}
            onClick={stopRecording}
            type="button"
          >
            녹음 종료
          </button>
          <button
            className="rounded-xl border border-[#e4d6c2] bg-white px-4 py-3 text-sm font-bold text-[#5f5144]"
            onClick={addMockVoice}
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
        {isRecording ? (
          <section className="mt-3 rounded-xl border border-[#d5e2cf] bg-[#fbfaf5] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#35533a]">녹음 중이에요.</p>
              <p className="text-xs font-semibold text-[#7d664f]">
                종료하면 다시 들을 수 있어요.
              </p>
            </div>
            <canvas
              aria-label="말소리에 맞춰 움직이는 녹음 막대"
              className="mt-3 h-16 w-full rounded-xl bg-white"
              height={64}
              ref={visualizerCanvasRef}
              width={320}
            />
            <p className="mt-2 text-xs font-semibold text-[#7d664f]">
              말소리에 맞춰 움직여요.
            </p>
          </section>
        ) : null}
        {voiceUrl ? (
          <audio className="mt-3 w-full" controls src={voiceUrl}>
            다시 듣기
          </audio>
        ) : null}
        {recordingFallbackMessage ? (
          <p className="mt-3 text-xs font-semibold leading-5 text-[#7d664f]">
            {recordingFallbackMessage}
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
      {item.hasLocalImage ? (
        <LocalImagePreview localImageId={item.localImageId} />
      ) : null}

      <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#5f5144]">
        <p>손주: {item.message}</p>
        <p>조부모: {item.grandparentReply}</p>
        {item.voiceDurationLabel || item.voiceNoteLabel ? (
          <p>{item.voiceDurationLabel ?? item.voiceNoteLabel}</p>
        ) : null}
        {item.hasLocalVoice ? (
          <LocalVoicePreview localVoiceId={item.localVoiceId} />
        ) : null}
        <p>
          당시 정원: Lv. {item.gardenLevelAtThatTime ?? 0} · 물{" "}
          {item.waterCountAtThatTime ?? 0}번
        </p>
        {item.localOnly ? (
          <p className="text-xs text-[#7d664f]">이 기기에만 저장됨</p>
        ) : null}
      </div>
    </article>
  );
}

function LocalImagePreview({ localImageId }: { localImageId?: string }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let isMounted = true;

    if (!localImageId) {
      return;
    }

    getLocalMedia(localImageId)
      .then((storedMedia) => {
        if (!storedMedia || !isMounted) {
          return;
        }
        objectUrl = URL.createObjectURL(storedMedia.blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        setImageUrl("");
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [localImageId]);

  if (!localImageId || !imageUrl) {
    return null;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="저장된 사진"
        className="mt-3 max-h-56 w-full rounded-2xl border border-[#d7e2e8] object-cover"
        src={imageUrl}
      />
    </>
  );
}

function LocalVoicePreview({ localVoiceId }: { localVoiceId?: string }) {
  const [voiceUrl, setVoiceUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let isMounted = true;

    if (!localVoiceId) {
      return;
    }

    getLocalMedia(localVoiceId)
      .then((storedMedia) => {
        if (!storedMedia || !isMounted) {
          return;
        }
        objectUrl = URL.createObjectURL(storedMedia.blob);
        setVoiceUrl(objectUrl);
      })
      .catch(() => {
        setVoiceUrl("");
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [localVoiceId]);

  if (!localVoiceId) {
    return null;
  }

  if (!voiceUrl) {
    return <p>음성메모 저장됨</p>;
  }

  return (
    <audio className="w-full" controls src={voiceUrl}>
      음성메모 저장됨
    </audio>
  );
}

function drawRoundedBar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.fill();
}

function createLocalMediaId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
