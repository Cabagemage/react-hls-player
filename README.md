# react-hls-player

A React **video player** with **HLS** support via [hls.js](https://github.com/video-dev/hls.js/), subtitles, multiple audio tracks, theming, and playback controls. Intended for React 18+ apps.

## Requirements

- React 18+
- React DOM 18+
- **hls.js** 1.6+ (peer dependency)

## Installation

```bash
npm install react-hls-player hls.js
```

## Basic usage

```tsx
import { VideoPlayer } from "react-hls-player";

export function Example() {
  return (
    <VideoPlayer
      videoUrl="https://example.com/stream/master.m3u8"
    />
  );
}
```

For progressive **MP4/WebM** (non-HLS), pass a direct file URL — the player sets `<video src="…">` accordingly.

## `VideoPlayer` props

### Required

| Prop | Type | Description |
|------|------|-------------|
| `videoUrl` | `string` | HLS manifest URL (`.m3u8`) or direct media URL. Changing it reloads the source. |

### Events & playback

| Prop | Type | Description |
|------|------|-------------|
| `onVideoStart` | `() => void` | Called when playback starts. |
| `onVideoEnd` | `() => void` | Called when the media ends. |
| `isAutoPlay` | `boolean` | Autoplay (often requires `muted` in browsers). |

### Appearance (theme)

| Prop | Type | Description |
|------|------|-------------|
| `themePreset` | `'default' \| 'burgundyGold'` | Base UI palette. |
| `theme` | `Partial<VideoPlayerTheme>` | Override individual CSS variables on top of the preset. |

Also exported: `videoPlayerDefaultTheme`, `videoPlayerBurgundyGoldTheme`, `videoPlayerMergeTheme`, `videoPlayerResolveTheme`, `videoPlayerThemeToCssVars`, and types `VideoPlayerTheme`, `VideoPlayerThemePreset`. The deprecated alias `hazbinHotelPlayerTheme` is still exported for compatibility.

### Subtitles

| Prop | Type | Description |
|------|------|-------------|
| `subtitleTracks` | `VideoPlayerSubtitleTrackSource[]` | Extra `<track>` elements (WebVTT, etc.). Tracks from the HLS manifest are picked up automatically. |
| `draggableSubtitles` | `boolean` | Draggable subtitle overlay; disabled on iPhone with native controls. Default `true`. |

Subtitle **font size** (presets in the CC menu) is stored globally in `localStorage` under `react-hls-player:subtitle-font-scale`.

| Prop | Type | Description |
|------|------|-------------|
| `defaultSubtitleTrackIndex` | `number \| null \| undefined` | Initial selection: index in `video.textTracks`, or `null` for off. If set, it **takes precedence** over the player’s built-in `localStorage` restore. |
| `persistSubtitlePreferenceLocally` | `boolean` | Persist subtitle choice in the player’s `localStorage` key. If `false`, use only your callbacks/state. Default `true`. |
| `onSubtitleTrackChange` | `(trackIndex: number \| null) => void` | User changed subtitles (menu or **C** key). Not fired on initial apply from `defaultSubtitleTrackIndex` or built-in `localStorage`. |

**C key** (Latin): toggles first subtitle track on/off; ignored in input fields and on iPhone with native controls.

### Audio (HLS, multiple tracks)

| Prop | Type | Description |
|------|------|-------------|
| `audioTrackLabels` | `string[]` | Labels by track index (`0`, `1`, …); replace manifest labels entirely. |
| `defaultAudioTrackIndex` | `number` | Track index after the manifest loads (when there is more than one track). |
| `onAudioTrackChange` | `(trackIndex: number) => void` | User picked a track in settings. Not fired when `defaultAudioTrackIndex` is applied initially. |

### Quality & playback rate

| Prop | Type | Description |
|------|------|-------------|
| `defaultQualityLevel` | `number` | HLS level: **`videoPlayerAutoModeIdx` (−1)** = auto; otherwise a level index from the manifest. Constant is exported from the package. |
| `onQualityChange` | `(levelIndex: number) => void` | User changed quality in the settings menu. |
| `defaultPlaybackRate` | `number` | Initial playback rate (applied on mount / source change). |
| `onPlaybackRateChange` | `(rate: number) => void` | User changed speed via UI. Not fired when `defaultPlaybackRate` is applied programmatically on init. |

```ts
import { videoPlayerAutoModeIdx } from "react-hls-player";
// defaultQualityLevel={videoPlayerAutoModeIdx}
```

### Example: persisting choices externally

Save selections in `onSubtitleTrackChange`, `onAudioTrackChange`, `onQualityChange`, and `onPlaybackRateChange`. Pass initial values via `defaultSubtitleTrackIndex`, `defaultAudioTrackIndex`, `defaultQualityLevel`, and `defaultPlaybackRate` (e.g. after reading from `localStorage` on mount).

```tsx
import { VideoPlayer, videoPlayerAutoModeIdx } from "react-hls-player";

<VideoPlayer
  videoUrl={url}
  persistSubtitlePreferenceLocally={false}
  defaultSubtitleTrackIndex={savedSubtitleIndex}
  onSubtitleTrackChange={(idx) => localStorage.setItem("sub", JSON.stringify(idx))}
  defaultAudioTrackIndex={savedAudioIndex}
  onAudioTrackChange={(i) => localStorage.setItem("audio", String(i))}
  defaultQualityLevel={videoPlayerAutoModeIdx}
  onQualityChange={(level) => localStorage.setItem("q", String(level))}
  defaultPlaybackRate={savedRate}
  onPlaybackRateChange={(r) => localStorage.setItem("rate", String(r))}
/>
```

When switching to another title, feed new `default*` values from your state or change the component `key` so defaults re-apply.

## Package exports

Public APIs use a **`videoPlayer` / `VideoPlayer` prefix** so names are clearly tied to this player.

| Export | Purpose |
|--------|---------|
| `VideoPlayer` | Main component. |
| `videoPlayerAutoModeIdx` | Constant `-1` for HLS auto quality. |
| `videoPlayerIsHlsPlaylistUrl` | Helper: whether a string looks like an HLS playlist URL. |
| `videoPlayerDefaultTheme`, `videoPlayerBurgundyGoldTheme`, `videoPlayerMergeTheme`, `videoPlayerResolveTheme`, `videoPlayerThemeToCssVars` | Theming helpers. |
| `VideoPlayerHlsService`, `IVideoPlayerService` | Service layer (see source). |
| Types | `VideoPlayerTheme`, `VideoPlayerThemePreset`, `VideoPlayerQuality`, `VideoPlayerSubtitleTrackSource`, `VideoPlayerAudioTrackOption`, `VideoPlayerSubtitleTrackItem` |

## Development & demo

```bash
npm install
npm run build
npm run dev
```

Demo build: `npm run build:demo`, preview: `npm run preview:demo`.

For local HLS with Vite, put files under `demo/public/…` and open the URL from the dev server root (not `file://`).

## License

ISC
