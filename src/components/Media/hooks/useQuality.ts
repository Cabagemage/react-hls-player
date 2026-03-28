import { useCallback, useState } from "react";
import { VideoPlayerQuality } from "../media.typedef";

const useQuality = (baseQualityIdx: number) => {
	const [availableQualities, setAvailableQualities] = useState<Array<VideoPlayerQuality>>([]);
	const [currentQuality, setCurrentQuality] = useState(baseQualityIdx);

	const changeQuality = useCallback((qualityIdx: number) => {
		setCurrentQuality(qualityIdx);
	}, []);

	const getAvailableQualities = useCallback((qualities: Array<VideoPlayerQuality>) => {
		setAvailableQualities(qualities);
	}, []);

	return {
		availableQualities,
		currentQuality,
		changeQuality,
		getAvailableQualities,
	};
};

export default useQuality;
