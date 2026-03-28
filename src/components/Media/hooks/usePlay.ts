import { MutableRefObject, useEffect, useState } from "react";

type UsePlayParams = {
	media: MutableRefObject<HTMLMediaElement | null>;
	onPlay?: () => void;
	isAutoPlay?: boolean;
	mediaUrl: string;
};
const usePlay = ({ media, onPlay, isAutoPlay = false, mediaUrl }: UsePlayParams) => {
	const [isPlaying, setIsPlaying] = useState(isAutoPlay);

	const play = async () => {
		const player = media.current;
		if (player !== null) {
			await player.play();
			setIsPlaying(true);
		}
		if (onPlay !== undefined) {
			onPlay();
		}
	};

	const stop = async () => {
		const player = media.current;
		if (player !== null) {
			await player.pause();
			setIsPlaying(false);
		}
	};

	const changeIsPlayingMode = (status: boolean) => {
		setIsPlaying(status);
	};

	const onTogglePlay = isPlaying ? stop : play;

	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			if (event.code === "Space") {
				await onTogglePlay();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isPlaying]);

	useEffect(() => {
		if (!isAutoPlay) {
			stop();
		}
	}, [mediaUrl]);
	return {
		isPlaying,
		play,
		stop,
		onTogglePlay,
		changeIsPlayingMode,
	};
};

export default usePlay;
