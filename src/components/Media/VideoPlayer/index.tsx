import useControlPanel from "../hooks/useControlPanel";
import useVolumeControl from "../hooks/useVolumeControl";
import useMediaPlaybackRate from "../hooks/useMediaPlaybackRate";
import { VideoPlayerSubtitleTrackSource } from "../media.typedef";
import useSubtitles from "../hooks/useSubtitles";
import useIsVisible from "../../../hooks/useIsVisible";
import useTime from "../hooks/useTime";
import useFullScreen from "../hooks/useFullScreen";
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSubtitleCueText } from "../hooks/useSubtitleCueText";
import { useSubtitleFontScale } from "../hooks/useSubtitleFontScale";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import usePlay from "../hooks/usePlay";
import getCurrentUserAgent from "../utils/getCurrentUserAgent";
import useHls from "../hooks/useHls";
import useProgressBar from "../hooks/useProgressBar";
import throttle from "../../../helpers/throttle";
import formQualityOptions from "../utils/formQualityOptions";
import { videoPlayerAutoModeIdx } from "../utils/constants";
import clsx from "clsx";
import style from "./style.module.css"
import CenteredPlayIcon from "./parts/CenteredPlayIcon";
import Loader from "../Loader";
import ProgressBar from "./parts/ProgressBar";
import PlayButton from "./parts/PlayButton";
import VolumeButton from "./parts/VolumeButton";
import VolumeController from "./parts/VolumeController";
import Time from "./parts/Time";
import SettingsMenu from "./parts/Settings";
import SettingsButton from "./parts/SettingsButton";
import SubtitlesButton from "./parts/SubtitlesButton";
import SubtitlesMenu from "./parts/SubtitlesMenu";
import FullScreenButton from "./parts/FullScreenButton";
import DraggableSubtitleOverlay from "./parts/DraggableSubtitleOverlay";
import {
	videoPlayerThemeToCssVars,
	videoPlayerResolveTheme,
	type VideoPlayerTheme,
	type VideoPlayerThemePreset,
} from "./theme";

type VideoPlayerProps = {
	videoUrl: string;
	onVideoStart?: () => void;
	onVideoEnd?: () => void;
	isAutoPlay?: boolean;
	/** Базовая палитра (`default` — сине-серый оригинал, `burgundyGold` — бордо/золото). */
	themePreset?: VideoPlayerThemePreset;
	/** Точечная подстройка цветов поверх пресета. */
	theme?: Partial<VideoPlayerTheme>;
	/** Внешние дорожки субтитров (WebVTT и др.); дорожки из HLS-манифеста подхватываются автоматически. */
	subtitleTracks?: VideoPlayerSubtitleTrackSource[];
	/**
	 * Подписи аудиодорожек HLS по индексу (0 — первая, 1 — вторая…). Полностью заменяют подписи из манифеста.
	 * Если не задано: при отсутствии имени/языка в манифесте первая дорожка подписывается «Русский», вторая — «English».
	 */
	audioTrackLabels?: string[];
	/**
	 * Перетаскиваемый блок субтитров поверх видео (нативные cue скрываются).
	 * На iOS с системными контролами не используется.
	 */
	draggableSubtitles?: boolean;

	/**
	 * Индекс дорожки в `video.textTracks` или `null` (выкл). Если задано — подставляется при появлении дорожек
	 * и имеет приоритет над встроенным восстановлением из localStorage плеера.
	 */
	defaultSubtitleTrackIndex?: number | null;
	/** Сохранять выбор субтитров во встроенный `localStorage` плеера. Если `false` — только ваш `onSubtitleTrackChange`. По умолчанию `true`. */
	persistSubtitlePreferenceLocally?: boolean;
	/**
	 * При смене субтитров пользователем (меню, клавиша C). Не вызывается при первичной подстановке
	 * из `defaultSubtitleTrackIndex` или из встроенного localStorage.
	 */
	onSubtitleTrackChange?: (trackIndex: number | null) => void;

	/** Индекс аудиодорожки HLS после загрузки (если дорожек несколько). */
	defaultAudioTrackIndex?: number;
	onAudioTrackChange?: (trackIndex: number) => void;

	/** Уровень качества HLS: `-1` (`videoPlayerAutoModeIdx`) = авто, иначе индекс уровня в манифесте. */
	defaultQualityLevel?: number;
	onQualityChange?: (levelIndex: number) => void;

	defaultPlaybackRate?: number;
	onPlaybackRateChange?: (rate: number) => void;
};

function VideoPlayer({
	videoUrl,
	onVideoStart,
	onVideoEnd,
	isAutoPlay = false,
	themePreset = "default",
	theme,
	subtitleTracks,
	audioTrackLabels,
	draggableSubtitles = true,
	defaultSubtitleTrackIndex,
	persistSubtitlePreferenceLocally = true,
	onSubtitleTrackChange,
	defaultAudioTrackIndex,
	onAudioTrackChange,
	defaultQualityLevel,
	onQualityChange,
	defaultPlaybackRate,
	onPlaybackRateChange,
}: VideoPlayerProps) {
	const userAgent = getCurrentUserAgent();
	const { fontScale: subtitleFontScale, setFontScale: setSubtitleFontScale } = useSubtitleFontScale();
	const themeStyle = useMemo(
		() =>
			({
				...videoPlayerThemeToCssVars(videoPlayerResolveTheme(themePreset, theme)),
				"--rp-subtitle-font-scale": String(subtitleFontScale),
			}) as CSSProperties,
		[themePreset, theme, subtitleFontScale],
	);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const videoStageRef = useRef<HTMLDivElement | null>(null);
	const videoWrapper = useRef<HTMLDivElement | null>(null);
	const progressBarRef = useRef<HTMLDivElement | null>(null);
	const { onTogglePlay, isPlaying, play } = usePlay({
		media: videoRef,
		onPlay: onVideoStart,
		isAutoPlay: isAutoPlay,
		mediaUrl: videoUrl,
	});
	const { changePlayedTime, formattedTime, formattedTimeWithRemaining, getMediaDuration, playedTimePercent } =
		useTime();
	const [showRemainingTime, setShowRemainingTime] = useState(false);
	const { isFullScreen, toggleFullScreen } = useFullScreen<HTMLMediaElement | HTMLDivElement | null>({
		elementRef: userAgent.isIPhone ? videoRef : videoWrapper,
	});
	const { isVisible: isLoaderVisible, onShow: onShowLoader, onHide: onHideLoader } = useIsVisible();
	const { onShowControlPanel, onHideControlPanel, isControlPanelVisible, handleMouseMove } =
		useControlPanel();
	const { isVolumeSliderVisible, volume, hideAudioSlider, showAudioSlider, onChangeSound, toggleSound } =
		useVolumeControl(videoRef);
	const [speedRate, changeSpeedRateBase] = useMediaPlaybackRate(videoRef);

	const changeSpeedRate = useCallback(
		(rate: number) => {
			changeSpeedRateBase(rate);
			onPlaybackRateChange?.(rate);
		},
		[changeSpeedRateBase, onPlaybackRateChange],
	);

	useEffect(() => {
		if (defaultPlaybackRate === undefined) {
			return;
		}
		changeSpeedRateBase(defaultPlaybackRate);
	}, [defaultPlaybackRate, changeSpeedRateBase, videoUrl]);

	const {
		subtitleTracks: detectedSubtitleTracks,
		activeSubtitleTrackIndex,
		selectSubtitleTrack,
		hasSubtitles,
	} = useSubtitles({ videoRef, videoUrl });
	const {
		isVisible: isSubtitlesMenuVisible,
		onShow: showSubtitlesMenuBase,
		onHide: hideSubtitlesMenu,
	} = useIsVisible();
	const { isVisible: isSettingsVisible, onShow: showSettingsBase, onHide: hideSettings } = useIsVisible();

	const showSubtitlesMenu = useCallback(() => {
		hideSettings();
		showSubtitlesMenuBase();
	}, [hideSettings, showSubtitlesMenuBase]);

	const showSettings = useCallback(() => {
		hideSubtitlesMenu();
		showSettingsBase();
	}, [hideSubtitlesMenu, showSettingsBase]);

	const subtitlesWrapRef = useOutsideClick<HTMLDivElement>(() => {
		hideSubtitlesMenu();
	});
	const showSubtitlesControls = hasSubtitles || (subtitleTracks?.length ?? 0) > 0;
	const customSubtitleDragEnabled =
		draggableSubtitles &&
		!userAgent.isIPhone &&
		showSubtitlesControls &&
		activeSubtitleTrackIndex !== null;
	const subtitleStorageKey = useMemo(() => {
		let h = 0;
		for (let i = 0; i < videoUrl.length; i++) {
			h = (Math.imul(31, h) + videoUrl.charCodeAt(i)) | 0;
		}
		return `u${h}`;
	}, [videoUrl]);
	const subtitleCueText = useSubtitleCueText({
		videoRef,
		videoUrl,
		enabled: customSubtitleDragEnabled,
	});
	const {
		availableQualities,
		currentQuality,
		changeVideoQuality,
		availableAudioTracks,
		currentAudioTrackIndex,
		changeAudioTrack,
	} = useHls({
		videoRef: videoRef,
		videoUrl,
		audioTrackLabels,
		defaultAudioTrackIndex,
		onAudioTrackChange,
	});

	const handleQualityChange = useCallback(
		(qualityIdx: number) => {
			changeVideoQuality(qualityIdx);
			onQualityChange?.(qualityIdx);
		},
		[changeVideoQuality, onQualityChange],
	);
	const {
		onDraggingProgressBar,
		isDragging,
		startDragging,
		stopDragging,
		onClickProgressBar,
		onProgress,
		onMediaEnded,
		uploadedMediaPercent,
	} = useProgressBar({
		progressBarRef,
		mediaRef: videoRef,
		onVideoEnd,
	});

	const onMetaDataLoadFinish = (event: SyntheticEvent<HTMLMediaElement>) => {
		const video = event.currentTarget;
		getMediaDuration(video.duration);
	};

	const handleTimeUpdate = throttle((e: SyntheticEvent<HTMLMediaElement>) => {
		if (!isDragging) {
			changePlayedTime(e.currentTarget.currentTime ?? 0);
		}
	}, 1000);

	const onDoubleClickHandler = () => {
		toggleFullScreen();
	};

	const qualityList = formQualityOptions(availableQualities);

	const audioSettings =
		availableAudioTracks.length > 1
			? {
					options: availableAudioTracks,
					current:
						availableAudioTracks.find((t) => t.index === currentAudioTrackIndex)?.label ?? "—",
					onAudioClick: changeAudioTrack,
				}
			: undefined;

	const trackElements = subtitleTracks?.map((t, i) => (
		<track
			key={`${t.srclang}-${i}`}
			kind="subtitles"
			src={t.src}
			srcLang={t.srclang}
			label={t.label}
			default={t.default}
		/>
	));

	const subtitlePrefStorageKey = `react-hls-player:subtitle-pref:${subtitleStorageKey}`;
	const subtitlePrefRestoredRef = useRef(false);

	useEffect(() => {
		subtitlePrefRestoredRef.current = false;
	}, [videoUrl]);

	useEffect(() => {
		if (detectedSubtitleTracks.length === 0 || subtitlePrefRestoredRef.current) {
			return;
		}
		subtitlePrefRestoredRef.current = true;

		if (defaultSubtitleTrackIndex !== undefined) {
			const v = defaultSubtitleTrackIndex;
			if (v === null || detectedSubtitleTracks.some((t) => t.trackIndex === v)) {
				selectSubtitleTrack(v);
			}
			return;
		}

		if (!persistSubtitlePreferenceLocally) {
			return;
		}

		try {
			const raw = localStorage.getItem(subtitlePrefStorageKey);
			if (raw !== null) {
				const { trackIndex } = JSON.parse(raw) as { trackIndex: number | null };
				if (trackIndex === null || detectedSubtitleTracks.some((t) => t.trackIndex === trackIndex)) {
					selectSubtitleTrack(trackIndex);
				}
			}
		} catch {
			/* ignore */
		}
	}, [
		detectedSubtitleTracks,
		subtitlePrefStorageKey,
		videoUrl,
		selectSubtitleTrack,
		defaultSubtitleTrackIndex,
		persistSubtitlePreferenceLocally,
	]);

	const persistSubtitleSelection = useCallback(
		(trackIndex: number | null) => {
			selectSubtitleTrack(trackIndex);
			if (persistSubtitlePreferenceLocally) {
				try {
					localStorage.setItem(subtitlePrefStorageKey, JSON.stringify({ trackIndex }));
				} catch {
					/* ignore */
				}
			}
			onSubtitleTrackChange?.(trackIndex);
		},
		[selectSubtitleTrack, subtitlePrefStorageKey, persistSubtitlePreferenceLocally, onSubtitleTrackChange],
	);

	const qualityDefaultAppliedRef = useRef(false);

	useEffect(() => {
		qualityDefaultAppliedRef.current = false;
	}, [videoUrl]);

	useEffect(() => {
		if (defaultQualityLevel === undefined || qualityDefaultAppliedRef.current) {
			return;
		}
		if (availableQualities.length === 0) {
			return;
		}
		const q = defaultQualityLevel;
		const ok = q === videoPlayerAutoModeIdx || (q >= 0 && q < availableQualities.length);
		if (!ok) {
			return;
		}
		changeVideoQuality(q);
		qualityDefaultAppliedRef.current = true;
	}, [availableQualities, defaultQualityLevel, changeVideoQuality, videoUrl]);

	useEffect(() => {
		if (!showSubtitlesControls || userAgent.isIPhone) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "c" && e.key !== "C") {
				return;
			}
			const el = e.target;
			if (
				el instanceof HTMLElement &&
				(el.isContentEditable || el.closest('[contenteditable="true"]'))
			) {
				return;
			}
			if (
				el instanceof HTMLInputElement ||
				el instanceof HTMLTextAreaElement ||
				el instanceof HTMLSelectElement
			) {
				return;
			}
			if (detectedSubtitleTracks.length === 0) {
				return;
			}
			e.preventDefault();
			if (activeSubtitleTrackIndex !== null) {
				persistSubtitleSelection(null);
			} else {
				persistSubtitleSelection(detectedSubtitleTracks[0].trackIndex);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [
		showSubtitlesControls,
		userAgent.isIPhone,
		activeSubtitleTrackIndex,
		detectedSubtitleTracks,
		persistSubtitleSelection,
	]);

	return (
		<div
			id="playerWrapper"
			ref={videoWrapper}
			style={themeStyle}
			className={clsx(style.wrapper, {
				[style.videoPlayerFullScreen]: isFullScreen,
			})}
		>
			<div
				ref={videoStageRef}
				onMouseLeave={isPlaying ? onHideControlPanel : undefined}
				onMouseEnter={onShowControlPanel}
				onMouseMove={handleMouseMove}
				className={clsx(style.videoPlayer, {
					[style.videoPlayerFullScreen]: isFullScreen,
				})}
			>
				{isControlPanelVisible && !userAgent.isIPhone && <CenteredPlayIcon isPlaying={isPlaying} />}
				{isLoaderVisible && !userAgent.isIPhone && <Loader />}
				{userAgent.isIPhone ? (
					// Eslint отключен, т.к. отсутствуют субтитры на данный момент
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video
						id={"player"}
						className={style.video}
						playsInline
						controls
						onLoadStart={onShowLoader}
						src={videoUrl}
						onCanPlayThrough={onHideLoader}
						onWaiting={onShowLoader}
						preload={"auto"}
						autoPlay={isAutoPlay}
						muted={isAutoPlay}
						onProgress={onProgress}
						onEnded={onMediaEnded}
						onDoubleClick={onDoubleClickHandler}
						onClick={onTogglePlay}
						onLoadedMetadata={onMetaDataLoadFinish}
						ref={videoRef}
						onTimeUpdate={handleTimeUpdate}
					>
						{trackElements}
					</video>
				) : (
					// Eslint отключен, т.к. отсутствуют субтитры на данный момент
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video
						id={"player"}
						className={clsx(style.video, {
							[style.videoHideNativeCues]: customSubtitleDragEnabled,
						})}
						controls={false}
						onLoadStart={onShowLoader}
						autoPlay={isAutoPlay}
						playsInline
						onCanPlayThrough={onHideLoader}
						onWaiting={onShowLoader}
						preload={"auto"}
						onProgress={onProgress}
						onEnded={onMediaEnded}
						onDoubleClick={onDoubleClickHandler}
						onClick={onTogglePlay}
						onLoadedMetadata={onMetaDataLoadFinish}
						ref={videoRef}
						onTimeUpdate={handleTimeUpdate}
					>
						{trackElements}
					</video>
				)}
				{customSubtitleDragEnabled ? (
					<DraggableSubtitleOverlay
						containerRef={videoStageRef}
						cueText={subtitleCueText}
						storageKey={subtitleStorageKey}
						fontScale={subtitleFontScale}
					/>
				) : null}
				<div
					className={clsx(style.controlPanel, {
						[style.hiddenControlPanel]:
							(!isControlPanelVisible && isPlaying && !isVolumeSliderVisible) || userAgent.isIPhone,
					})}
				>
					{/*
					Еслинт ругается на то, что у интерактивного элемента нет события, наступающего при нажатии
					по клавиатуре, однако они есть в хуке useControlPanel.
					*/}
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events*/}
					<div
						role={"progressbar"}
						tabIndex={-1}
						className={style.videoProgressBarWrapper}
						ref={progressBarRef}
						onMouseDown={startDragging}
						onMouseMove={(e) => {
							return onDraggingProgressBar({
								event: e,
								callback: (currentTime) => {
									changePlayedTime(currentTime);
								},
							});
						}}
						onMouseUp={stopDragging}
						onClick={(e) => {
							onClickProgressBar({
								event: e,
							});
						}}
					>
						<ProgressBar playedTimePercent={playedTimePercent} uploadedTimePercent={uploadedMediaPercent} />
					</div>
					<div className={style.controls}>
						<div className={style.controlsButtons}>
							<PlayButton isPlaying={isPlaying} onClick={onTogglePlay} />
							{!userAgent.isIos && (
								<div className={style.soundControl} onMouseLeave={hideAudioSlider}>
									<VolumeButton onMouseEnter={showAudioSlider} onClick={toggleSound} />
									<VolumeController
										isVisible={isVolumeSliderVisible}
										onChange={onChangeSound}
										value={volume}
									/>
									<Time
										isSoundProgressBarVisible={isVolumeSliderVisible}
										time={showRemainingTime ? formattedTimeWithRemaining : formattedTime}
										showRemaining={showRemainingTime}
										onToggleDisplay={() => setShowRemainingTime((v) => !v)}
									/>
								</div>
							)}
						</div>
						<div className={style.controlsButtons}>
							<SettingsMenu
								quality={{
									onQualityClick: handleQualityChange,
									options: qualityList,
									current: availableQualities[currentQuality]?.quality,
								}}
								onCloseMenu={hideSettings}
								speedRate={{
									onOptionClick: changeSpeedRate,
									current: speedRate,
								}}
								audio={audioSettings}
								isShow={isSettingsVisible}
							/>
							<SettingsButton onClick={showSettings} />
							{showSubtitlesControls && (
								<div ref={subtitlesWrapRef} className={style.subtitlesWrap}>
									<SubtitlesMenu
										isShow={isSubtitlesMenuVisible}
										onClose={hideSubtitlesMenu}
										tracks={detectedSubtitleTracks}
										activeTrackIndex={activeSubtitleTrackIndex}
										onSelect={persistSubtitleSelection}
										fontScale={subtitleFontScale}
										onFontScaleChange={setSubtitleFontScale}
									/>
									<SubtitlesButton
										isMenuOpen={isSubtitlesMenuVisible}
										onClick={() =>
											isSubtitlesMenuVisible ? hideSubtitlesMenu() : showSubtitlesMenu()
										}
									/>
								</div>
							)}

							<FullScreenButton onClick={toggleFullScreen} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default VideoPlayer;
