import Hls from "hls.js";
import { MutableRefObject } from "react";
import { videoPlayerIsHlsPlaylistUrl } from "./isHlsUrl";

type LoadVideo = {
	url: string;
	videoElement: MutableRefObject<HTMLVideoElement | null>;
};

function loadVideo({ videoElement, url }: LoadVideo) {
	const video = videoElement.current;
	if (video !== null) {
		if (Hls.isSupported() && videoPlayerIsHlsPlaylistUrl(url)) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			return hls;
		}
		video.src = url;
		return null;
	}
}

export default loadVideo;
