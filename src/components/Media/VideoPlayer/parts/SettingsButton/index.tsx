import settingsIcon from "../../../../../assets/media/video/settings.svg";
import style from "../ControlBarButton/style.module.css";


type SettingsButtonProps = {
	onClick: () => void;
};

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
	return (
		<button type="button" title={"Настройки"} aria-label={"Настройки"} className={style.button} onClick={onClick}>
			<img src={settingsIcon} width={16} height={16} alt="" />
		</button>
	);
};

export default SettingsButton;
