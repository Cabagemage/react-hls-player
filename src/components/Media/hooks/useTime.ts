import { useState } from "react";
import {getFormattedTime} from "../utils/getFormattedTime";


const useTime = () => {
	const [duration, setDuration] = useState(0);
	const [playedTime, setPlayedTime] = useState(0);
	const { minutes, seconds } = getFormattedTime(duration);
	const { minutes: currentMinutes, seconds: currentSeconds } = getFormattedTime(playedTime);
	const remaining = Math.max(0, duration - playedTime);
	const { minutes: remMinutes, seconds: remSeconds } = getFormattedTime(remaining);
	const formattedTime = `${currentMinutes}:${currentSeconds}/${minutes}:${seconds}`;
	/** Текущее / оставшееся (минус перед остатком, как в многих плеерах) */
	const formattedTimeWithRemaining = `${currentMinutes}:${currentSeconds}/-${remMinutes}:${remSeconds}`;
	const playedTimePercent = (playedTime / duration) * 100;

	const getMediaDuration = (duration: number) => {
		setDuration(duration);
	};

	const changePlayedTime = (time: number) => {
		setPlayedTime(time);
	};

	return {
		getMediaDuration,
		duration,
		playedTime,
		changePlayedTime,
		formattedTime,
		formattedTimeWithRemaining,
		playedTimePercent,
	};
};

export default useTime;
