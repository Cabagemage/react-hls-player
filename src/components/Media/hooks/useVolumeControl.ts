import { MutableRefObject, useCallback, useRef, useState } from "react";

const useVolumeControl = (mediaRef: MutableRefObject<HTMLMediaElement | null>) => {
	const [volume, setVolume] = useState(0.3);
	const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
	const volumeBeforeMuteRef = useRef(0.3);

	const showAudioSlider = () => {
		setIsVolumeSliderVisible(true);
	};
	const hideAudioSlider = () => {
		setIsVolumeSliderVisible(false);
	};

	const onChangeSound = (volume: string) => {
		const player = mediaRef.current;
		const newVolume = Number(volume);
		setVolume(newVolume);

		if (player) {
			player.volume = newVolume;
			if (newVolume > 0) {
				volumeBeforeMuteRef.current = newVolume;
			}
		}
	};

	const toggleSound = useCallback(() => {
		const player = mediaRef.current;
		if (!player) {
			return;
		}
		const effective = player.volume > 0 ? player.volume : volume;
		if (effective > 0) {
			volumeBeforeMuteRef.current = effective;
			player.volume = 0;
			setVolume(0);
			return;
		}
		const restore = volumeBeforeMuteRef.current > 0 ? volumeBeforeMuteRef.current : 0.3;
		player.volume = restore;
		setVolume(restore);
	}, [volume]);

	return {
		onChangeSound,
		toggleSound,
		volume,
		showAudioSlider,
		hideAudioSlider,
		isVolumeSliderVisible,
	};
};

export default useVolumeControl;
