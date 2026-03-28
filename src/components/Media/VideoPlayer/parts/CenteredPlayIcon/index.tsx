import s from "./CenteredPlayIcon.module.css";
import playIcon from  "../../../../../assets/media/video/play-centered.svg";
import pauseIcon from  "../../../../../assets/media/video/pause.svg";

import { memo } from "react";

type CenteredPlayIcon = {
	isPlaying: boolean;
};
const CenteredPlayIcon = memo(({ isPlaying }: CenteredPlayIcon) => {

	return (
		<div
			aria-label={!isPlaying ? "Воспроизвести" : "Остановить"}
			title={!isPlaying ? "Воспроизвести" : "Остановить"}
			className={s.wrapper}
		>
			<img src={!isPlaying ? playIcon : pauseIcon} width={64} height={64} />
		</div>
	);
});
CenteredPlayIcon.displayName = "CenteredPlayIcon";

export default CenteredPlayIcon;
