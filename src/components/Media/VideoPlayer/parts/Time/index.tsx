import style from "./style.module.css";
import clsx from "clsx";
import { KeyboardEvent, MouseEvent } from "react";

type TimeProps = {
	time: string;
	isSoundProgressBarVisible: boolean;
	/** Показывается ли во второй части оставшееся время */
	showRemaining: boolean;
	onToggleDisplay: () => void;
};

const Time = ({
	time,
	isSoundProgressBarVisible,
	showRemaining,
	onToggleDisplay,
}: TimeProps) => {
	const title = showRemaining
		? "Текущее и оставшееся время (нажмите — показать общую длительность)"
		: "Текущее и общее время (нажмите — показать оставшееся)";

	const onClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleDisplay();
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onToggleDisplay();
		}
	};

	return (
		<button
			type="button"
			title={title}
			aria-label={title}
			aria-pressed={showRemaining}
			className={clsx(style.time, style.timeClickable, {
				[style.visibleProgressBar]: isSoundProgressBarVisible,
			})}
			onClick={onClick}
			onKeyDown={onKeyDown}
		>
			{time}
		</button>
	);
};

export default Time;
