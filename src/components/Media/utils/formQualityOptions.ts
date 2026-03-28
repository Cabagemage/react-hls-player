import { VideoPlayerQuality } from "../media.typedef";
import { videoPlayerAutoModeIdx } from "./constants";

const formQualityOptions = (qualities: Array<VideoPlayerQuality>) => {
	const initialLevels: Array<VideoPlayerQuality> = [
		{
			quality: "Авто",
			level: videoPlayerAutoModeIdx,
		},
	];

	return initialLevels.concat(qualities);
};

export default formQualityOptions;
