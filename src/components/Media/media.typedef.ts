export type VideoPlayerQuality = {
	quality: string;
	level: number;
};

/** Внешние субтитры через элементы `track` (WebVTT и др.). */
export type VideoPlayerSubtitleTrackSource = {
	src: string;
	srclang: string;
	label: string;
	default?: boolean;
};

type QualitySettingsProps = {
	options: Array<VideoPlayerQuality>;
	onQualityClick: (qualityId: number) => void;
	current: string;
};

export type VideoPlayerAudioTrackOption = {
	label: string;
	index: number;
};

type AudioSettingsProps = {
	options: Array<VideoPlayerAudioTrackOption>;
	onAudioClick: (trackIndex: number) => void;
	current: string;
};

type SpeedRate = {
	current: number;
	onOptionClick: (speedRate: number) => void;
};

export type VideoPlayerSettings = {
	quality: QualitySettingsProps;
	speedRate: SpeedRate;
	/** Несколько аудиодорожек в HLS (через hls.js). */
	audio?: AudioSettingsProps;
};
