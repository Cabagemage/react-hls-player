
export function videoPlayerIsHlsPlaylistUrl(url: string): boolean {
	const trimmed = url.trim();
	if (!trimmed) {
		return false;
	}
	try {
		const parsed = new URL(trimmed, typeof window !== "undefined" ? window.location.href : "https://local.invalid/");
		return parsed.pathname.toLowerCase().endsWith(".m3u8");
	} catch {
		return /\.m3u8(\?|#|$)/i.test(trimmed);
	}
}
