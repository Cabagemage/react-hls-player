declare module "hls.js" {
    export type Level = {
        height: number;
    };

    export default class Hls {
        static Events: Record<string, string>;
        currentLevel: number;
        levels: Array<Level>;

        destroy(): void;

        attachMedia(videoElement: HTMLVideoElement): void;

        loadSource(url: string): void;

        on(MANIFEST_PARSED: string, callback: () => void): void;

        static isSupported(): boolean;
    }
}