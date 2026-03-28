import { useState } from "react";
import clsx from "clsx";
import style from "./style.module.css";
import { VideoPlayerSettings } from "../../../media.typedef";
import { useOutsideClick } from "../../../../../hooks/useOutsideClick";

type SettingsMenuProps = {
	isShow: boolean;
	onCloseMenu: () => void;
	quality: VideoPlayerSettings["quality"];
	speedRate: VideoPlayerSettings["speedRate"];
	audio?: VideoPlayerSettings["audio"];
};

const speedRates = [0.5, 0.75, 1, 1.5, 2];

const SettingsMenu = ({ isShow, onCloseMenu, quality, speedRate, audio }: SettingsMenuProps) => {
	const [isQualityIsShowing, setIsQualityIsShowing] = useState(false);
	const [isSpeedControlShowing, setIsSpeedControlShowing] = useState(false);
	const [isAudioMenuShowing, setIsAudioMenuShowing] = useState(false);

	const menuRef = useOutsideClick<HTMLDivElement>(() => {
		setIsQualityIsShowing(false);
		setIsSpeedControlShowing(false);
		setIsAudioMenuShowing(false);
		onCloseMenu();
	});

	const closeQualityOptions = () => {
		setIsQualityIsShowing(false);
	};
	const onQualityClick = () => {
		setIsQualityIsShowing(true);
	};

	const onQualityOptionClick = (qualityIdx: number) => {
		quality.onQualityClick(qualityIdx);
		setIsQualityIsShowing(false);
	};
	const onSpeedOptionClick = (speedOption: number) => {
		speedRate.onOptionClick(speedOption);
		setIsSpeedControlShowing(false);
		onCloseMenu();
	};
	const onSpeedRateSettingsClick = () => {
		setIsSpeedControlShowing(true);
	};
	const closeSpeedRateMenu = () => {
		setIsSpeedControlShowing(false);
	};

	const showAudioRow = audio !== undefined && audio.options.length > 1;

	const onAudioRowClick = () => {
		setIsAudioMenuShowing(true);
	};
	const closeAudioMenu = () => {
		setIsAudioMenuShowing(false);
	};
	const onAudioOptionClick = (trackIndex: number) => {
		audio?.onAudioClick(trackIndex);
		setIsAudioMenuShowing(false);
	};

	const isSubMenuShowing = isQualityIsShowing || isSpeedControlShowing || isAudioMenuShowing;

	return (
		<div
			ref={menuRef}
			className={clsx(style.settings, {
				[style.settingsShow]: isShow,
				[style.settingsHidden]: !isShow,
			})}
			role="menu"
		>
			{!isSubMenuShowing ? (
				<div>
					<button type="button" onClick={onQualityClick} className={style.menuItem}>
						<span>Качество</span> &nbsp; <span>{quality?.current ?? "авто"}</span>
					</button>
					{showAudioRow ? (
						<button type="button" onClick={onAudioRowClick} className={style.menuItem}>
							<span>Аудио</span> &nbsp; <span>{audio?.current ?? "—"}</span>
						</button>
					) : null}
					<button type="button" onClick={onSpeedRateSettingsClick} className={style.menuItem}>
						<span>Скорость</span> &nbsp; <span>{speedRate.current}x</span>
					</button>
				</div>
			) : null}
			{isQualityIsShowing ? (
				<div
					className={clsx(style.settings, {
						[style.submenuShow]: isShow,
						[style.submenuHidden]: !isShow,
					})}
					role="menu"
				>
					<button type="button" className={style.menuItem} onClick={closeQualityOptions}>
						Вернуться
					</button>
					{quality.options.map((option) => {
						return (
							<button
								key={option.quality}
								type="button"
								className={style.menuItem}
								onClick={() => {
									return onQualityOptionClick(option.level);
								}}
							>
								{option.quality}
							</button>
						);
					})}
				</div>
			) : null}
			{isAudioMenuShowing && audio ? (
				<div
					className={clsx(style.settings, {
						[style.submenuShow]: isShow,
						[style.submenuHidden]: !isShow,
					})}
					role="menu"
				>
					<button type="button" className={style.menuItem} onClick={closeAudioMenu}>
						Вернуться
					</button>
					{audio.options.map((option) => {
						return (
							<button
								key={option.index}
								type="button"
								className={style.menuItem}
								onClick={() => {
									return onAudioOptionClick(option.index);
								}}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			) : null}
			{isSpeedControlShowing && (
				<div
					className={clsx(style.settings, {
						[style.submenuShow]: isShow,
						[style.submenuHidden]: !isShow,
					})}
					role="menu"
				>
					<button type="button" className={style.menuItem} onClick={closeSpeedRateMenu}>
						Вернуться
					</button>
					{speedRates.map((option) => {
						return (
							<button
								key={option}
								type="button"
								className={style.menuItem}
								onClick={() => {
									return onSpeedOptionClick(option);
								}}
							>
								{option}x
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default SettingsMenu;
