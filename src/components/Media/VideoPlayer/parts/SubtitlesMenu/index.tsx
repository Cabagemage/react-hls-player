import { useEffect, useId } from "react";
import clsx from "clsx";
import type { VideoPlayerSubtitleTrackItem } from "../../../hooks/useSubtitles";
import { SUBTITLE_FONT_PRESETS } from "../../../hooks/useSubtitleFontScale";
import style from "./style.module.css";

type SubtitlesMenuProps = {
	isShow: boolean;
	onClose: () => void;
	tracks: VideoPlayerSubtitleTrackItem[];
	activeTrackIndex: number | null;
	onSelect: (trackIndex: number | null) => void;
	fontScale: number;
	onFontScaleChange: (scale: number) => void;
};

const SubtitlesMenu = ({
	isShow,
	onClose,
	tracks,
	activeTrackIndex,
	onSelect,
	fontScale,
	onFontScaleChange,
}: SubtitlesMenuProps) => {
	const fontLabelId = useId();

	useEffect(() => {
		if (!isShow) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isShow, onClose]);

	return (
		<div
			className={clsx(style.menu, {
				[style.menuHidden]: !isShow,
				[style.menuShow]: isShow,
			})}
			role="menu"
			aria-label="Субтитры"
		>
			<div className={style.menuScroll}>
				<div className={style.fontSection}>
					<div className={style.fontSectionLabel} id={fontLabelId}>
						Размер шрифта
					</div>
					<div className={style.fontRow} role="group" aria-labelledby={fontLabelId}>
						{SUBTITLE_FONT_PRESETS.map(({ value, label }) => (
							<button
								key={value}
								type="button"
								className={clsx(style.fontChip, {
									[style.fontChipActive]: Math.abs(fontScale - value) < 0.01,
								})}
								aria-pressed={Math.abs(fontScale - value) < 0.01}
								onClick={() => onFontScaleChange(value)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
				<button
					type="button"
					role="menuitemradio"
					aria-checked={activeTrackIndex === null}
					className={style.menuItem}
					onClick={() => {
						onSelect(null);
						onClose();
					}}
				>
					<span className={style.menuItemLabel}>Выключить</span>
					{activeTrackIndex === null ? <span aria-hidden>✓</span> : null}
				</button>
				{tracks.map((t) => {
					const selected = activeTrackIndex === t.trackIndex;
					return (
						<button
							key={t.trackIndex}
							type="button"
							role="menuitemradio"
							aria-checked={selected}
							className={style.menuItem}
							onClick={() => {
								onSelect(t.trackIndex);
								onClose();
							}}
						>
							<span className={style.menuItemLabel}>
								{t.label}
								{t.language ? <span className={style.lang}> ({t.language})</span> : null}
							</span>
							{selected ? <span aria-hidden>✓</span> : null}
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default SubtitlesMenu;
