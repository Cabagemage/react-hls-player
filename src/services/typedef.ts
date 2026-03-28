export interface IVideoPlayerService<T> {
	init(): void;
	loadVideo(videoUrl: string): void;
	attachMedia(video: HTMLVideoElement): void;
	destroy(): void;
	changeQuality(qualityIdx: number): void;
	get currentQuality(): number;
	get instance(): T | null;
}
