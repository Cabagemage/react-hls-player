export { default as VideoPlayer } from "./components/Media/VideoPlayer";
export {
	hazbinHotelPlayerTheme,
	videoPlayerBurgundyGoldTheme,
	videoPlayerDefaultTheme,
	videoPlayerMergeTheme,
	videoPlayerResolveTheme,
	videoPlayerThemeToCssVars,
} from "./components/Media/VideoPlayer/theme";
export type { VideoPlayerTheme, VideoPlayerThemePreset } from "./components/Media/VideoPlayer/theme";
export type {
	VideoPlayerAudioTrackOption,
	VideoPlayerQuality,
	VideoPlayerSubtitleTrackSource,
} from "./components/Media/media.typedef";
export type { VideoPlayerSubtitleTrackItem } from "./components/Media/hooks/useSubtitles";
export { VideoPlayerHlsService } from "./services/HlsService";
export type { IVideoPlayerService } from "./services/typedef";
export { videoPlayerIsHlsPlaylistUrl } from "./components/Media/utils/isHlsUrl";
export { videoPlayerAutoModeIdx } from "./components/Media/utils/constants";
