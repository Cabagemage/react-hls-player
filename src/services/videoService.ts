
export interface IVideoService <T>{
    init():void;
    loadVideo(videoUrl:string):void;
    destroy():void;
    changeQuality(qualityIdx:number):void;
    get currentQuality(): number;
    get instance():T | null;
}
