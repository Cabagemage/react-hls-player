import { RefObject, useEffect, useRef } from "react";

export const useOutsideClick = <Element extends HTMLElement>(callback?: () => void): RefObject<Element> => {
	const ref = useRef<Element>(null);

	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node) && callback !== undefined) {
				callback();
			}
		};

		document.addEventListener("click", handleClick, true);

		return () => {
			document.removeEventListener("click", handleClick, true);
		};
	}, [callback, ref]);

	return ref;
};
