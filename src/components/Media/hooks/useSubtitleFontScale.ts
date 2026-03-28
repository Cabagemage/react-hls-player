import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "react-hls-player:subtitle-font-scale";
const DEFAULT = 1;
const MIN = 0.75;
const MAX = 2;

/** Пресеты размера шрифта субтитров (меню и масштаб к базовому размеру). */
export const SUBTITLE_FONT_PRESETS = [
	{ value: 0.75, label: "75%" },
	{ value: 1, label: "100%" },
	{ value: 1.25, label: "125%" },
	{ value: 1.5, label: "150%" },
	{ value: 2, label: "200%" },
] as const;

export function clampSubtitleFontScale(n: number): number {
	return Math.min(MAX, Math.max(MIN, n));
}

/** Масштаб шрифта субтитров; сохраняется в `localStorage` глобально. */
export function useSubtitleFontScale() {
	const [fontScale, setFontScaleState] = useState(DEFAULT);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw !== null) {
				const n = parseFloat(raw);
				if (!Number.isNaN(n)) {
					setFontScaleState(clampSubtitleFontScale(n));
				}
			}
		} catch {
			/* ignore */
		}
	}, []);

	const setFontScale = useCallback((value: number) => {
		const next = clampSubtitleFontScale(value);
		setFontScaleState(next);
		try {
			localStorage.setItem(STORAGE_KEY, String(next));
		} catch {
			/* ignore */
		}
	}, []);

	return { fontScale, setFontScale };
}
