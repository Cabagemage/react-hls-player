import { MutableRefObject, useCallback, useEffect, useState } from "react";

export type VideoPlayerSubtitleTrackItem = {
	/** Индекс в `video.textTracks` */
	trackIndex: number;
	label: string;
	language: string;
};

const isCaptionKind = (kind: string) => kind === "subtitles" || kind === "captions";

function collectTracks(video: HTMLVideoElement): VideoPlayerSubtitleTrackItem[] {
	const out: VideoPlayerSubtitleTrackItem[] = [];
	const { textTracks } = video;
	for (let i = 0; i < textTracks.length; i++) {
		const t = textTracks[i];
		if (!isCaptionKind(t.kind)) {
			continue;
		}
		const label = (t.label || "").trim();
		const lang = (t.language || "").trim();
		out.push({
			trackIndex: i,
			label: label || lang || `Субтитры ${out.length + 1}`,
			language: lang,
		});
	}
	return out;
}

function findShowingTrackIndex(video: HTMLVideoElement): number | null {
	const { textTracks } = video;
	for (let i = 0; i < textTracks.length; i++) {
		const t = textTracks[i];
		if (isCaptionKind(t.kind) && t.mode === "showing") {
			return i;
		}
	}
	return null;
}

function applySelection(video: HTMLVideoElement, selectedIndex: number | null) {
	const { textTracks } = video;
	for (let i = 0; i < textTracks.length; i++) {
		const t = textTracks[i];
		if (!isCaptionKind(t.kind)) {
			continue;
		}
		if (selectedIndex === null) {
			t.mode = "disabled";
		} else if (i === selectedIndex) {
			t.mode = "showing";
		} else {
			t.mode = "disabled";
		}
	}
}

type UseSubtitlesParams = {
	videoRef: MutableRefObject<HTMLVideoElement | null>;
	/** Сброс выбора при смене источника */
	videoUrl: string;
};

const useSubtitles = ({ videoRef, videoUrl }: UseSubtitlesParams) => {
	const [tracks, setTracks] = useState<VideoPlayerSubtitleTrackItem[]>([]);
	const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);

	const syncTracksFromVideo = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		const next = collectTracks(video);
		setTracks(next);
		const showing = findShowingTrackIndex(video);
		setActiveTrackIndex((prev) => {
			if (prev === null) {
				return showing;
			}
			if (next.some((item) => item.trackIndex === prev)) {
				return prev;
			}
			return showing;
		});
	}, [videoRef]);

	useEffect(() => {
		setActiveTrackIndex(null);
		setTracks([]);
	}, [videoUrl]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}

		const onSync = () => syncTracksFromVideo();

		video.addEventListener("loadedmetadata", onSync);
		video.addEventListener("loadeddata", onSync);
		video.textTracks.addEventListener("addtrack", onSync);
		video.textTracks.addEventListener("change", onSync);
		onSync();

		return () => {
			video.removeEventListener("loadedmetadata", onSync);
			video.removeEventListener("loadeddata", onSync);
			video.textTracks.removeEventListener("addtrack", onSync);
			video.textTracks.removeEventListener("change", onSync);
		};
	}, [videoRef, videoUrl, syncTracksFromVideo]);

	const selectSubtitleTrack = useCallback(
		(trackIndex: number | null) => {
			const video = videoRef.current;
			if (!video) {
				return;
			}
			applySelection(video, trackIndex);
			setActiveTrackIndex(trackIndex);
		},
		[videoRef],
	);

	const hasSubtitles = tracks.length > 0;

	return {
		subtitleTracks: tracks,
		activeSubtitleTrackIndex: activeTrackIndex,
		selectSubtitleTrack,
		hasSubtitles,
	};
};

export default useSubtitles;
