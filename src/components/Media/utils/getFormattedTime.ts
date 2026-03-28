export const getFormattedTime = (duration: number) => {
	const minutes = Math.floor(duration / 60);
	const seconds = Math.floor(duration % 60);

	const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	return {
		minutes: formattedMinutes,
		seconds: formattedSeconds,
	};
};
