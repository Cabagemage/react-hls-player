import { MutableRefObject, useState } from "react";

type MediaPlaybackRate = [number, (speedRate: number) => void];
const useMediaPlaybackRate = (mediaRef: MutableRefObject<HTMLMediaElement | null>): MediaPlaybackRate => {
	const [mediaPlayBackRate, setMediaPlayBackRate] = useState(1);

	const changeSpeedRate = (speedRate: number) => {
		const media = mediaRef.current;
		if (media) {
			setMediaPlayBackRate(speedRate);
			media.playbackRate = speedRate;
		}
	};

	return [mediaPlayBackRate, changeSpeedRate];
};

export default useMediaPlaybackRate;
