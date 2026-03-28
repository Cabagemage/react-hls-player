import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type RefObject,
} from "react";
import clsx from "clsx";
import style from "./style.module.css";

const STORAGE_PREFIX = "react-hls-player:subtitle-pos:";

type Props = {
	containerRef: RefObject<HTMLDivElement | null>;
	cueText: string;
	storageKey: string;
	/** Множитель к базовому размеру шрифта (0.75–2) */
	fontScale: number;
};

function clampOverlayIntoContainer(
	container: HTMLElement,
	overlay: HTMLElement,
	margin: number,
): number | null {
	const cr = container.getBoundingClientRect();
	const br = overlay.getBoundingClientRect();
	let dy = 0;
	if (br.top < cr.top + margin) {
		dy += cr.top + margin - br.top;
	}
	if (br.bottom > cr.bottom - margin) {
		dy += cr.bottom - margin - br.bottom;
	}
	if (Math.abs(dy) < 0.5) {
		return null;
	}
	return dy;
}

export default function DraggableSubtitleOverlay({
	containerRef,
	cueText,
	storageKey,
	fontScale,
}: Props) {
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const dragRef = useRef<{ py: number; oy: number } | null>(null);
	const offsetYRef = useRef(0);
	const [offsetY, setOffsetY] = useState(0);

	const storageId = STORAGE_PREFIX + storageKey;

	useEffect(() => {
		offsetYRef.current = offsetY;
	}, [offsetY]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(storageId);
			if (raw) {
				const p = JSON.parse(raw) as { x?: number; y?: number };
				if (typeof p.y === "number") {
					setOffsetY(p.y);
				}
			}
		} catch {
			/* ignore */
		}
	}, [storageId]);

	useEffect(() => {
		try {
			localStorage.setItem(storageId, JSON.stringify({ y: offsetY }));
		} catch {
			/* ignore */
		}
	}, [offsetY, storageId]);

	const applyInsetClamp = useCallback(() => {
		const container = containerRef.current;
		const overlay = overlayRef.current;
		if (!container || !overlay) {
			return;
		}
		const delta = clampOverlayIntoContainer(container, overlay, 8);
		if (delta !== null) {
			setOffsetY((prev) => prev + delta);
		}
	}, [containerRef]);

	useLayoutEffect(() => {
		if (!cueText) {
			return;
		}
		applyInsetClamp();
	}, [offsetY, cueText, applyInsetClamp]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) {
			return;
		}
		const ro = new ResizeObserver(() => {
			applyInsetClamp();
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [containerRef, applyInsetClamp]);

	const moveDrag = useCallback((clientY: number) => {
		const d = dragRef.current;
		if (!d) {
			return;
		}
		setOffsetY(d.oy + (clientY - d.py));
	}, []);

	const endDrag = useCallback(() => {
		dragRef.current = null;
	}, []);

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			if (dragRef.current) {
				moveDrag(e.clientY);
			}
		};
		const onUp = () => endDrag();
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
		};
	}, [moveDrag, endDrag]);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragRef.current = {
			py: e.clientY,
			oy: offsetYRef.current,
		};
		(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
	}, []);

	const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		endDrag();
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}
	}, [endDrag]);

	if (!cueText) {
		return null;
	}

	return (
		<div
			ref={overlayRef}
			className={style.overlay}
			style={
				{
					transform: `translateY(${offsetY}px)`,
					"--subtitle-font-scale": String(fontScale),
				} as CSSProperties
			}
		>
			<div
				className={style.dragHandle}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				title="Перетащить субтитры по вертикали"
				aria-label="Перетащить блок субтитров по вертикали"
				role="slider"
				tabIndex={0}
			/>
			<div className={clsx(style.cueText)}>{cueText}</div>
		</div>
	);
}
