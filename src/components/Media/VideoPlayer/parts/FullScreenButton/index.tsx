import fullScreenIcon from "../../../../../assets/media/video/fullScreen.svg";
import style from "../ControlBarButton/style.module.css";


type FullScreenButtonProps = {
	onClick: () => void;
};

const FullScreenButton = ({ onClick }: FullScreenButtonProps) => {
	return (
		<button
			type="button"
			aria-label={"Полноэкранный режим"}
			title={"Полноэкранный режим"}
			onClick={onClick}
			className={style.button}
		>
			<img src={fullScreenIcon} width={16} height={16} alt="" />
		</button>
	);
};

export default FullScreenButton;
