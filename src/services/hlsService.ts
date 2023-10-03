import Hls from "hls.js";
import {IVideoService} from "./videoService";

export class HlsService implements IVideoService<Hls>{
    private hlsInstance:Hls | null = null;
    private quality = 0
    init(){
        if (Hls.isSupported()) {
            const hlsInstance = new Hls();
            return hlsInstance;
        }
        else{
            throw new Error("HLS service is not supported in your environment.")
        }
    }
    loadVideo(videoUrl: string){
        const isVideoUrlSupported = videoUrl.endsWith("m3u8");
        if(this.hlsInstance && isVideoUrlSupported){
            this.hlsInstance.loadSource(videoUrl);
        }
        else{
            throw new Error("Passed video is not supported")
        }
    }
    destroy() {
        if(this.hlsInstance){
            this.hlsInstance.destroy();
        }
    }
    changeQuality(qualityIdx: number) {
        this.quality = qualityIdx;
        if(this.hlsInstance){
            this.hlsInstance.currentLevel = qualityIdx;
        }
    }
    get instance(){
        return this.hlsInstance
    }
    get currentQuality(){
        return this.quality
    }
}