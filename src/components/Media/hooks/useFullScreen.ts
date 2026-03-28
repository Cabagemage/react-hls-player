import { useState, useEffect, MutableRefObject } from "react";

type UseFullScreenParams<T> = {
	elementRef: MutableRefObject<T>;
};
const useFullScreen = <T extends Element | null>({ elementRef }: UseFullScreenParams<T>) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	const enterFullScreen = () => {
		const element = elementRef.current as (Element & {
			webkitRequestFullscreen?: () => void;
			msRequestFullscreen?: () => void;
		}) | null;
		if (element === null) {
			return;
		}
		if (element.requestFullscreen) {
			void element.requestFullscreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
		setIsFullScreen(true);
	};

	const exitFullScreen = () => {
		const docWithBrowsersExitFunctions = document as Document & {
			mozCancelFullScreen(): Promise<void>;
			webkitExitFullscreen(): Promise<void>;
			msExitFullscreen(): Promise<void>;
		};
		if (docWithBrowsersExitFunctions.exitFullscreen) {
			docWithBrowsersExitFunctions.exitFullscreen();
		} else if (docWithBrowsersExitFunctions.mozCancelFullScreen) {
			/* Firefox */
			docWithBrowsersExitFunctions.mozCancelFullScreen();
		} else if (docWithBrowsersExitFunctions.webkitExitFullscreen) {
			/* Chrome, Safari and Opera */
			docWithBrowsersExitFunctions.webkitExitFullscreen();
		} else if (docWithBrowsersExitFunctions.msExitFullscreen) {
			/* IE/Edge */
			docWithBrowsersExitFunctions.msExitFullscreen();
		}
		setIsFullScreen(false);
	};

	useEffect(() => {
		const handleFullScreenChange = () => {
			setIsFullScreen(document.fullscreenElement !== null);
		};
		document.addEventListener("fullscreenchange", handleFullScreenChange);
		document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
		document.addEventListener("msfullscreenchange", handleFullScreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullScreenChange);
			document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
			document.removeEventListener("msfullscreenchange", handleFullScreenChange);
		};
	}, []);

	return {
		isFullScreen,
		enterFullScreen,
		exitFullScreen,
		toggleFullScreen: isFullScreen ? exitFullScreen : enterFullScreen,
	};
};

export default useFullScreen;
