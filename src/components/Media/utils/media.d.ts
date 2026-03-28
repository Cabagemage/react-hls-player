declare module "hls.js" {
	export type Level = {
		height: number;
	};

	export type AudioTrack = {
		name?: string;
		lang?: string;
		groupId?: string;
	};

	export default class Hls {
		static Events: Record<string, string> & {
			MANIFEST_PARSED: string;
			AUDIO_TRACKS_UPDATED: string;
			AUDIO_TRACK_SWITCHED: string;
		};

		currentLevel: number;
		levels: Array<Level>;
		audioTracks: Array<AudioTrack>;
		audioTrack: number;

		destroy(): void;

		attachMedia(videoElement: HTMLVideoElement): void;

		loadSource(url: string): void;

		on(event: string, callback: () => void): void;

		static isSupported(): boolean;
	}
}
