import subtitlesIcon from "../../../../../assets/media/video/subtitles.svg";
import style from "../ControlBarButton/style.module.css";

type SubtitlesButtonProps = {
	isMenuOpen: boolean;
	onClick: () => void;
};

const SubtitlesButton = ({ onClick, isMenuOpen }: SubtitlesButtonProps) => {
	return (
		<button
			type="button"
			aria-label="Субтитры"
			title="Субтитры (C — вкл/выкл)"
			aria-expanded={isMenuOpen}
			aria-haspopup="menu"
			className={style.button}
			onClick={onClick}
		>
			<img src={subtitlesIcon} width={16} height={16} alt="" />
		</button>
	);
};

export default SubtitlesButton;
