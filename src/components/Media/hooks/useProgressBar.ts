import {
	MouseEvent,
	MutableRefObject,
	SyntheticEvent,
	useCallback,
	useEffect,
	useState,
} from "react";

type ProgressBarDragEvent = {
	event: MouseEvent<HTMLDivElement>;
	callback?: (currentTime: number) => void;
};
type ProgressBarClickEvent = {
	event: MouseEvent<HTMLDivElement>;
	callback?: (currentTime: number) => void;
};

type UseProgressBarParams = {
	progressBarRef: MutableRefObject<HTMLDivElement | null>;
	mediaRef: MutableRefObject<HTMLMediaElement | null>;
	onVideoEnd?: () => void;
};
const useProgressBar = ({ progressBarRef, mediaRef, onVideoEnd }: UseProgressBarParams) => {
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedMediaPercent, setUploadedMediaPercent] = useState(0);

	const onClickProgressBar = useCallback(
		({ event, callback }: ProgressBarClickEvent) => {
			const player = mediaRef.current;
			const progressBar = progressBarRef.current;
			if (player === null || progressBar === null) {
				return;
			}
			const { left, width } = progressBar.getBoundingClientRect();
			const mouseX = event.clientX - left;
			const progress = mouseX / width;
			const currentTime = progress * player.duration;
			player.currentTime = currentTime;

			if (callback) {
				callback(currentTime);
			}
		},
		[mediaRef, progressBarRef],
	);

	const onDraggingProgressBar = useCallback(
		({ event, callback }: ProgressBarDragEvent) => {
			const progressBar = progressBarRef.current;
			const media = mediaRef.current;
			if (progressBar === null || media === null) {
				return;
			}

			if (isDragging) {
				const progressBarRect = progressBar.getBoundingClientRect();
				const progress = (event.clientX - progressBarRect.left) / progressBarRect.width;
				const { duration } = media;
				if (progress >= 0 && Number.isFinite(duration) && duration > 0) {
					const currentTime = duration * progress;

					if (callback) {
						callback(currentTime);
					}
				}
			}
		},
		[isDragging, mediaRef, progressBarRef],
	);

	const startDragging = () => {
		setIsDragging(true);
	};

	const stopDragging = () => {
		setIsDragging(false);
	};

	const onProgress = (e: SyntheticEvent<HTMLMediaElement>) => {
		const bufferedTimeRanges = e.currentTarget.buffered;
		const duration = e.currentTarget.duration;
		if (bufferedTimeRanges.length > 0 && Number.isFinite(duration) && duration > 0) {
			const bufferedTime = bufferedTimeRanges.end(bufferedTimeRanges.length - 1);
			const uploadedVideoPercent = (bufferedTime / duration) * 100;
			setUploadedMediaPercent(uploadedVideoPercent);
		}
	};

	const onMediaEnded = useCallback(() => {
		onVideoEnd?.();
	}, [onVideoEnd]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const media = mediaRef.current;
			if (!media) {
				return;
			}
			switch (event.code) {
				case "ArrowLeft": {
					media.currentTime -= 5;
					break;
				}
				case "ArrowRight": {
					media.currentTime += 5;
					break;
				}
				default:
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [mediaRef]);

	return {
		isDragging,
		startDragging,
		stopDragging,
		onDraggingProgressBar,
		onClickProgressBar,
		onProgress,
		onMediaEnded,
		uploadedMediaPercent,
	};
};

export default useProgressBar;
