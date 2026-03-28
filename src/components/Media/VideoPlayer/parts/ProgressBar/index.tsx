import style from "./style.module.css";

type ProgressBarProps = {
	playedTimePercent: number;
	uploadedTimePercent: number;
};

const ProgressBar = ({ playedTimePercent, uploadedTimePercent }: ProgressBarProps) => {
	return (
		<div aria-label={"Индикатор загрузки видео"} className={style.videoProgressBar}>
			<div
				className={style.carriage}
				style={{
					width: `${playedTimePercent}%`,
				}}
			/>
			<div
				className={style.uploaded}
				style={{
					width: `${uploadedTimePercent}%`,
				}}
			/>
		</div>
	);
};

export default ProgressBar;
