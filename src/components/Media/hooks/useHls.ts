import Hls, { AudioTrack as HlsAudioTrack, Level } from "hls.js";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import useQuality from "./useQuality";
import { videoPlayerAutoModeIdx } from "../utils/constants";
import { videoPlayerIsHlsPlaylistUrl } from "../utils/isHlsUrl";
import type { VideoPlayerAudioTrackOption } from "../media.typedef";

type UseHlsParams = {
	videoRef: MutableRefObject<HTMLVideoElement | null>;
	videoUrl: string;
	/** Подписи по индексу дорожки (полностью перекрывают манифест). */
	audioTrackLabels?: string[];
	/** Индекс аудиодорожки HLS (0…), подставляется после загрузки манифеста, если дорожек несколько. */
	defaultAudioTrackIndex?: number;
	/** Сообщает о смене аудиодорожки пользователем. */
	onAudioTrackChange?: (trackIndex: number) => void;
};

const sortLevels = (levels: Array<Level>) => {
	return [...levels].sort((a, b) => {
		return a.height - b.height;
	});
};
const mapLevels = (levels: Array<Level>) => {
	return levels.map((item, idx) => {
		return {
			quality: `${item.height}p`,
			level: idx,
		};
	});
};

function formatAudioLabel(t: HlsAudioTrack, index: number, overrides?: string[]): string {
	const override = overrides?.[index]?.trim();
	if (override) {
		return override;
	}
	const name = (t.name || "").trim();
	const lang = (t.lang || "").trim();
	if (name && lang) {
		return `${name} (${lang})`;
	}
	if (name) {
		return name;
	}
	if (lang) {
		return lang;
	}
	if (index === 0) {
		return "Русский";
	}
	if (index === 1) {
		return "English";
	}
	return `Аудио ${index + 1}`;
}

const useHls = ({
	videoRef,
	videoUrl,
	audioTrackLabels,
	defaultAudioTrackIndex,
	onAudioTrackChange,
}: UseHlsParams) => {
	const hlsRef = useRef<Hls | null>(null);
	const defaultAudioTrackIndexRef = useRef(defaultAudioTrackIndex);
	defaultAudioTrackIndexRef.current = defaultAudioTrackIndex;
	const audioDefaultAppliedForUrlRef = useRef(false);

	const { availableQualities, getAvailableQualities, currentQuality, changeQuality } =
		useQuality(videoPlayerAutoModeIdx);

	const [availableAudioTracks, setAvailableAudioTracks] = useState<VideoPlayerAudioTrackOption[]>([]);
	const [currentAudioTrackIndex, setCurrentAudioTrackIndex] = useState(0);

	const changeVideoQuality = (qualityIdx: number) => {
		if (hlsRef.current === null) {
			return;
		}
		hlsRef.current.currentLevel = qualityIdx;
		changeQuality(qualityIdx);
	};

	const changeAudioTrack = useCallback(
		(trackIndex: number) => {
			const hls = hlsRef.current;
			if (!hls) {
				return;
			}
			hls.audioTrack = trackIndex;
			setCurrentAudioTrackIndex(trackIndex);
			onAudioTrackChange?.(trackIndex);
		},
		[onAudioTrackChange],
	);

	useEffect(() => {
		changeQuality(videoPlayerAutoModeIdx);
		getAvailableQualities([]);
		setAvailableAudioTracks([]);
		setCurrentAudioTrackIndex(0);
		audioDefaultAppliedForUrlRef.current = false;
	}, [videoUrl, changeQuality, getAvailableQualities]);

	useEffect(() => {
		const el = videoRef.current;
		if (!el) {
			return;
		}

		const isHls = videoPlayerIsHlsPlaylistUrl(videoUrl);

		hlsRef.current?.destroy();
		hlsRef.current = null;

		if (Hls.isSupported() && isHls) {
			const hls = new Hls();
			hlsRef.current = hls;
			hls.loadSource(videoUrl);
			hls.attachMedia(el);

			const syncAudioTracks = () => {
				const instance = hlsRef.current;
				if (!instance) {
					return;
				}
				const list = instance.audioTracks ?? [];
				if (list.length <= 1) {
					setAvailableAudioTracks([]);
					setCurrentAudioTrackIndex(instance.audioTrack);
					return;
				}
				setAvailableAudioTracks(
					list.map((t, i) => ({
						index: i,
						label: formatAudioLabel(t, i, audioTrackLabels),
					})),
				);
				const def = defaultAudioTrackIndexRef.current;
				if (
					def !== undefined &&
					!audioDefaultAppliedForUrlRef.current &&
					def >= 0 &&
					def < list.length
				) {
					instance.audioTrack = def;
					setCurrentAudioTrackIndex(def);
					audioDefaultAppliedForUrlRef.current = true;
				} else {
					setCurrentAudioTrackIndex(instance.audioTrack);
				}
			};

			const onManifestParsed = () => {
				const instance = hlsRef.current;
				if (!instance) {
					return;
				}
				const sortedLevels = sortLevels([...(instance.levels ?? [])]);
				getAvailableQualities(mapLevels(sortedLevels));
				syncAudioTracks();
			};

			hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
			hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, syncAudioTracks);
			hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
				const instance = hlsRef.current;
				if (instance) {
					setCurrentAudioTrackIndex(instance.audioTrack);
				}
			});

			return () => {
				hls.destroy();
				if (hlsRef.current === hls) {
					hlsRef.current = null;
				}
			};
		}

		el.src = videoUrl;
		setAvailableAudioTracks([]);
		return () => {
			el.removeAttribute("src");
		};
	}, [videoUrl, getAvailableQualities, audioTrackLabels]);

	return {
		availableQualities,
		currentQuality,
		changeVideoQuality,
		availableAudioTracks,
		currentAudioTrackIndex,
		changeAudioTrack,
	};
};

export default useHls;
