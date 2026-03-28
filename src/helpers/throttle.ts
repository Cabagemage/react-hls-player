export default function throttle<A extends unknown[]>(callback: (...args: A) => void, limit: number): (...args: A) => void {
	let waiting = false;
	return (...args: A) => {
		if (!waiting) {
			callback(...args);
			waiting = true;
			setTimeout(() => {
				waiting = false;
			}, limit);
		}
	};
}
