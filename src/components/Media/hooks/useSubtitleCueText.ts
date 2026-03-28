import { MutableRefObject, useEffect, useState } from "react";

const isCaptionKind = (kind: string) => kind === "subtitles" || kind === "captions";

function readActiveCueText(video: HTMLVideoElement): string {
	const { textTracks } = video;
	for (let i = 0; i < textTracks.length; i++) {
		const t = textTracks[i];
		if (!isCaptionKind(t.kind) || t.mode !== "showing") {
			continue;
		}
		const cues = t.activeCues;
		if (!cues || cues.length === 0) {
			continue;
		}
		const parts: string[] = [];
		for (let j = 0; j < cues.length; j++) {
			parts.push((cues[j] as VTTCue).text);
		}
		return parts.join("\n").trim();
	}
	return "";
}

type Params = {
	videoRef: MutableRefObject<HTMLVideoElement | null>;
	videoUrl: string;
	enabled: boolean;
};

/** Текст активных субтитров для кастомного оверлея (нативные cue скрыты). */
export function useSubtitleCueText({ videoRef, videoUrl, enabled }: Params): string {
	const [text, setText] = useState("");

	useEffect(() => {
		setText("");
	}, [videoUrl]);

	useEffect(() => {
		if (!enabled) {
			setText("");
			return;
		}

		const tick = () => {
			const video = videoRef.current;
			if (!video) {
				return;
			}
			setText(readActiveCueText(video));
		};

		const video = videoRef.current;
		if (video) {
			tick();
		}

		const onTime = () => tick();
		const onAddTrack = () => tick();

		const el = videoRef.current;
		if (el) {
			el.addEventListener("timeupdate", onTime);
			el.textTracks.addEventListener("addtrack", onAddTrack);
		}

		const id = window.setInterval(tick, 120);

		return () => {
			window.clearInterval(id);
			if (el) {
				el.removeEventListener("timeupdate", onTime);
				el.textTracks.removeEventListener("addtrack", onAddTrack);
			}
		};
	}, [videoRef, enabled, videoUrl]);

	return enabled ? text : "";
}
