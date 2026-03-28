import { ChangeEvent } from "react";
import style from "./style.module.css";

type VolumeControllerProps = {
	value: number;
	onChange: (value: string) => void;
	isVisible: boolean;
};

const VolumeController = ({ onChange, value = 0, isVisible }: VolumeControllerProps) => {
	const onVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className={style.rangeWrapper}>
			<input
				aria-label="Изменение громкости"
				className={style.volumeRange}
				type="range"
				min="0"
				max="1"
				step="0.1"
				value={value}
				onChange={onVolumeChange}
			/>
		</div>
	);
};

export default VolumeController;
