import { FormEvent, useCallback, useState } from "react";
import { videoPlayerAutoModeIdx, VideoPlayer } from "react-hls-player";

const DEFAULT_HLS =
	"";

const LOCAL_HLS_EXAMPLE = "/tmp-hls-episode/master.m3u8";

const LS_SUB = "react-hls-player-demo:subtitle-track-index";
const LS_AUDIO = "react-hls-player-demo:audio-track-index";

function readSavedSubtitleIndex(): number | null {
	try {
		const raw = localStorage.getItem(LS_SUB);
		if (raw === null) {
			return 0;
		}
		return JSON.parse(raw) as number | null;
	} catch {
		return 0;
	}
}

function readSavedAudioIndex(): number {
	try {
		const raw = localStorage.getItem(LS_AUDIO);
		if (raw === null) {
			return 0;
		}
		const n = parseInt(raw, 10);
		return Number.isNaN(n) ? 0 : n;
	} catch {
		return 0;
	}
}

type LogLine = { id: number; time: string; text: string };

let logId = 0;

export default function App() {
	const [input, setInput] = useState(DEFAULT_HLS);
	const [videoUrl, setVideoUrl] = useState(DEFAULT_HLS);
	const [log, setLog] = useState<LogLine[]>([]);
	const [defaultSubtitleTrackIndex, setDefaultSubtitleTrackIndex] = useState<number | null>(
		readSavedSubtitleIndex,
	);
	const [defaultAudioTrackIndex, setDefaultAudioTrackIndex] = useState(readSavedAudioIndex);

	const pushLog = useCallback((text: string) => {
		const time = new Date().toLocaleTimeString();
		logId += 1;
		setLog((prev) => [{ id: logId, time, text }, ...prev].slice(0, 12));
	}, []);

	const onSubtitleTrackChange = useCallback(
		(trackIndex: number | null) => {
			try {
				localStorage.setItem(LS_SUB, JSON.stringify(trackIndex));
			} catch {
				/* ignore */
			}
			setDefaultSubtitleTrackIndex(trackIndex);
			pushLog(
				trackIndex === null
					? "onSubtitleTrackChange: субтитры выключены (сохранено)"
					: `onSubtitleTrackChange: дорожка textTracks[${trackIndex}] (сохранено)`,
			);
		},
		[pushLog],
	);

	const onAudioTrackChange = useCallback(
		(trackIndex: number) => {
			try {
				localStorage.setItem(LS_AUDIO, String(trackIndex));
			} catch {
				/* ignore */
			}
			setDefaultAudioTrackIndex(trackIndex);
			pushLog(`onAudioTrackChange: аудио ${trackIndex} (сохранено)`);
		},
		[pushLog],
	);

	const onQualityChange = useCallback(
		(levelIndex: number) => {
			pushLog(
				levelIndex === videoPlayerAutoModeIdx
					? "onQualityChange: авто"
					: `onQualityChange: уровень HLS ${levelIndex}`,
			);
		},
		[pushLog],
	);

	const onPlaybackRateChange = useCallback(
		(rate: number) => {
			pushLog(`onPlaybackRateChange: ${rate}×`);
		},
		[pushLog],
	);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		const next = input.trim();
		if (next) {
			setVideoUrl(next);
		}
	};

	return (
		<div
			style={{
				maxWidth: 960,
				margin: "0 auto",
				padding: 24,
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h1 style={{ marginTop: 0 }}>react-hls-player</h1>
			<p style={{ color: "#555", fontSize: 14 }}>
				Локальная проверка: alias <code>react-hls-player</code> → <code>src/index.ts</code>.{" "}
				<strong>Локальный HLS:</strong> скопируйте папку в{" "}
				<code>demo/public/tmp-hls-episode/</code> и введите URL{" "}
				<code>{LOCAL_HLS_EXAMPLE}</code> (не <code>../src/...</code> и не <code>file://</code> — так
				браузер не загрузит поток). Субтитры: CC, если есть дорожки в манифесте или{" "}
				<code>subtitleTracks</code> с подходящим VTT. Индексы субтитров/аудио в демо пишутся в{" "}
				<code>localStorage</code> и подставляются как <code>default*</code>.
			</p>
			<form
				onSubmit={onSubmit}
				style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="URL .m3u8 или прогрессивного видео"
					style={{
						flex: "1 1 240px",
						minWidth: 0,
						padding: "8px 12px",
						fontSize: 14,
					}}
				/>
				<button type="submit" style={{ padding: "8px 16px" }}>
					Загрузить
				</button>
			</form>
			<div
				style={{
					aspectRatio: "16 / 9",
					background: "#111",
					borderRadius: 8,
					overflow: "hidden",
				}}
			>
				<VideoPlayer
					key={videoUrl}
					videoUrl={videoUrl}
					themePreset="burgundyGold"
					persistSubtitlePreferenceLocally={false}
					defaultSubtitleTrackIndex={defaultSubtitleTrackIndex}
					defaultAudioTrackIndex={defaultAudioTrackIndex}
					defaultQualityLevel={videoPlayerAutoModeIdx}
					onSubtitleTrackChange={onSubtitleTrackChange}
					onAudioTrackChange={onAudioTrackChange}
					onQualityChange={onQualityChange}
					onPlaybackRateChange={onPlaybackRateChange}
				/>
			</div>
			<div
				style={{
					marginTop: 16,
					padding: 12,
					background: "#f5f5f5",
					borderRadius: 8,
					fontSize: 13,
					fontFamily: "ui-monospace, monospace",
				}}
			>
				<div style={{ fontWeight: 600, marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
					Колбэки (последние события)
				</div>
				{log.length === 0 ? (
					<span style={{ color: "#888" }}>Поменяйте субтитры, аудио, качество или скорость в плеере…</span>
				) : (
					<ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
						{log.map((line) => (
							<li key={line.id}>
								<span style={{ color: "#888" }}>[{line.time}]</span> {line.text}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
