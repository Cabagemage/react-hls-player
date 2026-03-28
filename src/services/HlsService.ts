import Hls from "hls.js";
import { IVideoPlayerService } from "./typedef";
import { videoPlayerIsHlsPlaylistUrl } from "../components/Media/utils/isHlsUrl";

export class VideoPlayerHlsService implements IVideoPlayerService<Hls> {
	private hlsInstance: Hls | null = null;
	private quality = 0;

	init(): void {
		if (!Hls.isSupported()) {
			throw new Error("HLS service is not supported in your environment.");
		}
		this.hlsInstance = new Hls();
	}

	loadVideo(videoUrl: string): void {
		if (!this.hlsInstance) {
			throw new Error("Call init() before loadVideo().");
		}
		if (!videoPlayerIsHlsPlaylistUrl(videoUrl)) {
			throw new Error("Passed video URL is not an HLS playlist (.m3u8).");
		}
		this.hlsInstance.loadSource(videoUrl);
	}

	attachMedia(video: HTMLVideoElement): void {
		if (!this.hlsInstance) {
			throw new Error("Call init() before attachMedia().");
		}
		this.hlsInstance.attachMedia(video);
	}

	destroy(): void {
		if (this.hlsInstance) {
			this.hlsInstance.destroy();
			this.hlsInstance = null;
		}
	}

	changeQuality(qualityIdx: number): void {
		this.quality = qualityIdx;
		if (this.hlsInstance) {
			this.hlsInstance.currentLevel = qualityIdx;
		}
	}

	get instance(): Hls | null {
		return this.hlsInstance;
	}

	get currentQuality(): number {
		return this.quality;
	}
}
