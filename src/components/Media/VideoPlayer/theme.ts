import type { CSSProperties } from "react";

/** Настраиваемая палитра плеера (прокидывается в CSS-переменные `--rp-*`). */
export type VideoPlayerTheme = {
	controlPanelBg: string;
	textPrimary: string;
	progressTrack: string;
	progressPlayed: string;
	progressBuffered: string;
	loaderOverlay: string;
	loaderOverlayOpacity: string;
	loaderSpinnerPrimary: string;
	loaderSpinnerAccent: string;
	settingsBg: string;
	settingsText: string;
	settingsShadow: string;
	volumeTrack: string;
	volumeTrackFirefox: string;
	volumeThumbWebkit: string;
	volumeThumbFirefox: string;
	hoveredTimeBg: string;
	hoveredTimeText: string;
	videoCueColor: string;
	videoCueBackground: string;
	listBackground: string;
	/** Фон кнопок панели (play, звук, настройки, субтитры, fullscreen) */
	controlBtnBg: string;
	controlBtnHoverBg: string;
	controlBtnActiveBg: string;
	controlBtnFocusRing: string;
};

export const videoPlayerDefaultTheme: VideoPlayerTheme = {
	controlPanelBg: "rgba(0, 0, 0, 0.5)",
	textPrimary: "#ffffff",
	progressTrack: "rgba(234, 234, 234, 0.5)",
	progressPlayed: "#338bf2",
	progressBuffered: "rgba(234, 234, 234, 0.5)",
	loaderOverlay: "#2a2c2f",
	loaderOverlayOpacity: "0.5",
	loaderSpinnerPrimary: "#ffffff",
	loaderSpinnerAccent: "#ff3d00",
	settingsBg: "#ffffffe6",
	settingsText: "#4a5464",
	settingsShadow: "0 1px 2px #00000026",
	volumeTrack: "#dee8ef",
	volumeTrackFirefox: "#d7e0ea",
	volumeThumbWebkit: "#676b6b",
	volumeThumbFirefox: "#cdd6d9",
	hoveredTimeBg: "#888888",
	hoveredTimeText: "#000000",
	videoCueColor: "white",
	videoCueBackground: "black",
	listBackground: "rgba(0, 0, 0, 0.5)",
	controlBtnBg: "rgba(255, 255, 255, 0.1)",
	controlBtnHoverBg: "rgba(255, 255, 255, 0.2)",
	controlBtnActiveBg: "rgba(255, 255, 255, 0.14)",
	controlBtnFocusRing: "rgba(255, 255, 255, 0.55)",
};

/** Тёмный бордовый фон, золотые акценты, тёплый текст. */
export const videoPlayerBurgundyGoldTheme: VideoPlayerTheme = {
	controlPanelBg: "linear-gradient(180deg, rgba(12, 4, 8, 0.2) 0%, rgba(26, 8, 14, 0.88) 100%)",
	textPrimary: "#f4e4bc",
	progressTrack: "rgba(120, 30, 55, 0.45)",
	progressPlayed: "#c9a227",
	progressBuffered: "rgba(201, 162, 39, 0.32)",
	loaderOverlay: "#140208",
	loaderOverlayOpacity: "0.65",
	loaderSpinnerPrimary: "#f4e4bc",
	loaderSpinnerAccent: "#b91c5c",
	settingsBg: "rgba(22, 8, 14, 0.96)",
	settingsText: "#f4e4bc",
	settingsShadow: "0 4px 24px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(201, 162, 39, 0.25)",
	volumeTrack: "rgba(201, 162, 39, 0.28)",
	volumeTrackFirefox: "rgba(185, 140, 60, 0.35)",
	volumeThumbWebkit: "#c9a227",
	volumeThumbFirefox: "#d4af37",
	hoveredTimeBg: "#4a1520",
	hoveredTimeText: "#f4e4bc",
	videoCueColor: "#f4e4bc",
	videoCueBackground: "rgba(12, 4, 8, 0.92)",
	listBackground: "rgba(12, 4, 8, 0.75)",
	controlBtnBg: "rgba(201, 162, 39, 0.14)",
	controlBtnHoverBg: "rgba(201, 162, 39, 0.26)",
	controlBtnActiveBg: "rgba(201, 162, 39, 0.2)",
	controlBtnFocusRing: "rgba(244, 228, 188, 0.65)",
};

export function videoPlayerMergeTheme(
	base: VideoPlayerTheme,
	patch: Partial<VideoPlayerTheme>,
): VideoPlayerTheme {
	return { ...base, ...patch };
}

export function videoPlayerThemeToCssVars(theme: VideoPlayerTheme): CSSProperties {
	return {
		"--rp-control-panel-bg": theme.controlPanelBg,
		"--rp-text-primary": theme.textPrimary,
		"--rp-progress-track": theme.progressTrack,
		"--rp-progress-played": theme.progressPlayed,
		"--rp-progress-buffered": theme.progressBuffered,
		"--rp-loader-overlay": theme.loaderOverlay,
		"--rp-loader-overlay-opacity": theme.loaderOverlayOpacity,
		"--rp-loader-spinner-primary": theme.loaderSpinnerPrimary,
		"--rp-loader-spinner-accent": theme.loaderSpinnerAccent,
		"--rp-settings-bg": theme.settingsBg,
		"--rp-settings-text": theme.settingsText,
		"--rp-settings-shadow": theme.settingsShadow,
		"--rp-volume-track": theme.volumeTrack,
		"--rp-volume-track-firefox": theme.volumeTrackFirefox,
		"--rp-volume-thumb-webkit": theme.volumeThumbWebkit,
		"--rp-volume-thumb-firefox": theme.volumeThumbFirefox,
		"--rp-hovered-time-bg": theme.hoveredTimeBg,
		"--rp-hovered-time-text": theme.hoveredTimeText,
		"--rp-video-cue-color": theme.videoCueColor,
		"--rp-video-cue-bg": theme.videoCueBackground,
		"--rp-list-bg": theme.listBackground,
		"--rp-control-btn-bg": theme.controlBtnBg,
		"--rp-control-btn-hover-bg": theme.controlBtnHoverBg,
		"--rp-control-btn-active-bg": theme.controlBtnActiveBg,
		"--rp-control-btn-focus-ring": theme.controlBtnFocusRing,
	} as CSSProperties;
}

export type VideoPlayerThemePreset = "default" | "burgundyGold";

export function videoPlayerResolveTheme(
	preset: VideoPlayerThemePreset,
	overrides?: Partial<VideoPlayerTheme>,
): VideoPlayerTheme {
	const base =
		preset === "burgundyGold" ? videoPlayerBurgundyGoldTheme : videoPlayerDefaultTheme;
	return videoPlayerMergeTheme(base, overrides ?? {});
}

/** @deprecated Renamed to {@link videoPlayerBurgundyGoldTheme}. */
export const hazbinHotelPlayerTheme = videoPlayerBurgundyGoldTheme;
