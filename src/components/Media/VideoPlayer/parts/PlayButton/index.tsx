import playIcon from "../../../../../assets/media/video/play.svg";
import pauseIcon from "../../../../../assets/media/video/pause.svg";
import style from "../ControlBarButton/style.module.css";

type PlayButtonProps = {
	isPlaying: boolean;
	onClick: () => void;
};

const PlayButton = ({ isPlaying, onClick }: PlayButtonProps) => {
	return (
		<button
			type="button"
			aria-label={!isPlaying ? "Воспроизвести" : "Остановить"}
			title={!isPlaying ? "Воспроизвести" : "Остановить"}
			className={style.button}
			onClick={onClick}
		>
			<img src={!isPlaying ? playIcon : pauseIcon} width={16} height={16} alt="" />
		</button>
	);
};

export default PlayButton;
