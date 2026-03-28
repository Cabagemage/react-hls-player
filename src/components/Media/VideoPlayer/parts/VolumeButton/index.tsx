import { MouseEventHandler } from "react";
import volumeIcon from "../../../../../assets/media/video/sound-control.svg";
import style from "../ControlBarButton/style.module.css";

type VolumeIconProps = {
	onMouseEnter: MouseEventHandler<HTMLButtonElement>;
	onClick: MouseEventHandler<HTMLButtonElement>;
};

const VolumeButton = ({ onClick, onMouseEnter }: VolumeIconProps) => {
	return (
		<button
			aria-label={"Звук"}
			title={"Звук"}
			type="button"
			className={style.button}
			onMouseEnter={onMouseEnter}
			onClick={onClick}
		>
			<img src={volumeIcon} width={16} height={16} alt="" />
		</button>
	);
};

export default VolumeButton;
