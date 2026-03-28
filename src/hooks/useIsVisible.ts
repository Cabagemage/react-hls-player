import { useState } from "react";

const useIsVisible = (defaultValue = false) => {
	const [isVisible, setIsVisible] = useState(defaultValue);

	const onShow = () => {
		setIsVisible(true);
	};
	const onHide = () => {
		setIsVisible(false);
	};

	return {
		isVisible,
		onShow,
		onHide,
	};
};

export default useIsVisible;
