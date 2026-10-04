declare const AUDIO: "audio";

declare type Audio_2 = typeof AUDIO;

export declare enum AVLogLevel {
    /**
     * Print no output.
     */
    AV_LOG_QUIET = -8,
    /**
     * Something went really wrong and we will crash now.
     */
    AV_LOG_PANIC = 0,
    /**
     * Something went wrong and recovery is not possible.
     * For example, no header was found for a format which depends
     * on headers or an illegal combination of parameters is used.
     */
    AV_LOG_FATAL = 8,
    /**
     * Something went wrong and cannot losslessly be recovered.
     * However, not all future data is affected.
     */
    AV_LOG_ERROR = 16,
    /**
     * Something somehow does not look correct. This may or may not
     * lead to problems. An example would be the use of '-vstrict -2'.
     */
    AV_LOG_WARNING = 24,
    /**
     * Standard information.
     */
    AV_LOG_INFO = 32,
    /**
     * Detailed information.
     */
    AV_LOG_VERBOSE = 40,
    /**
     * Stuff which is only useful for libav* developers.
     */
    AV_LOG_DEBUG = 48,
    /**
     * Extremely verbose debugging, useful for libav* development.
     */
    AV_LOG_TRACE = 56
}

/**
 * sync with ffmpeg libavutil/avutil.h
 */
export declare enum AVMediaType {
    AVMEDIA_TYPE_UNKNOWN = -1,///< Usually treated as AVMEDIA_TYPE_DATA
    AVMEDIA_TYPE_VIDEO = 0,
    AVMEDIA_TYPE_AUDIO = 1,
    AVMEDIA_TYPE_DATA = 2,///< Opaque data information usually continuous
    AVMEDIA_TYPE_SUBTITLE = 3,
    AVMEDIA_TYPE_ATTACHMENT = 4,///< Opaque data information usually sparse
    AVMEDIA_TYPE_NB = 5
}

export declare enum AVSeekFlag {
    /**
     * seek backward
     */
    AVSEEK_FLAG_BACKWARD = 1,
    /**
     * seeking based on position in bytes
     */
    AVSEEK_FLAG_BYTE = 2,
    /**
     * seek to any frame, even non-keyframes
     */
    AVSEEK_FLAG_ANY = 4,
    /**
     * seeking based on frame number
     */
    AVSEEK_FLAG_FRAME = 8
}

declare type MediaType = Video | Audio_2 | Subtitle;

declare type MediaTypeToChunk = {
    [VIDEO]: EncodedVideoChunk;
    [AUDIO]: EncodedAudioChunk;
};

declare type MediaTypeToConfig = {
    [VIDEO]: VideoDecoderConfig;
    [AUDIO]: AudioDecoderConfig;
};

declare const SUBTITLE: "subtitle";

declare type Subtitle = typeof SUBTITLE;

declare const VIDEO: "video";

declare type Video = typeof VIDEO;

export declare interface WebAVPacket {
    keyframe: 0 | 1;
    timestamp: number;
    duration: number;
    size: number;
    data: Uint8Array;
}

export declare interface WebAVStream {
    index: number;
    id: number;
    codec_type: AVMediaType;
    codec_type_string: string;
    codec_name: string;
    codec_string: string;
    color_primaries: string;
    color_range: string;
    color_space: string;
    color_transfer: string;
    profile: string;
    pix_fmt: string;
    level: number;
    width: number;
    height: number;
    channels: number;
    sample_rate: number;
    sample_fmt: string;
    bit_rate: string;
    extradata_size: number;
    extradata: Uint8Array;
    r_frame_rate: string;
    avg_frame_rate: string;
    sample_aspect_ratio: string;
    display_aspect_ratio: string;
    start_time: number;
    duration: number;
    rotation: number;
    flip: boolean;
    nb_frames: string;
    tags: Record<string, string>;
}

declare type WebCodecsSupportedMediaType = Extract<MediaType, Video | Audio_2>;

/**
 * WebDemuxer
 *
 * A class to demux media files in the browser using WebAssembly.
 *
 * @example
 * ```typescript
 * const demuxer = new WebDemuxer();
 * await demuxer.load(file);
 * const encodedChunk = await demuxer.seek('video', 10);
 * ```
 */
export declare class WebDemuxer {
    private wasmWorker;
    private wasmWorkerLoadStatus;
    private msgId;
    source?: File | string;
    constructor(options?: WebDemuxerOptions);
    private post;
    private getFromWorker;
    /**
     * Load a file for demuxing
     * @param source source to load
     * @returns load status
     */
    load(source: File | string): Promise<void>;
    /**
     * Destroy the demuxer instance
     * terminate the worker
     */
    destroy(): void;
    /**
     * Get file media info
     * @returns WebMediaInfo
     */
    getMediaInfo(): Promise<WebMediaInfo>;
    /**
     * Gets information about a specified stream in the media file.
     * @param streamType The type of media stream
     * @param streamIndex The index of the media stream
     * @returns WebAVStream
     */
    getAVStream(streamType?: AVMediaType, streamIndex?: number): Promise<WebAVStream>;
    /**
     * Get all streams
     * @returns WebAVStream[]
     */
    getAVStreams(): Promise<WebAVStream[]>;
    /**
     * Gets the data at a specified time point in the media file.
     * @param time time in seconds
     * @param streamType The type of media stream
     * @param streamIndex The index of the media stream
     * @param seekFlag The seek flag
     * @returns WebAVPacket
     */
    getAVPacket(time: number, streamType?: AVMediaType, streamIndex?: number, seekFlag?: AVSeekFlag): Promise<WebAVPacket>;
    /**
     * Get all packets at a time point from all streams
     * @param time time in seconds
     * @param seekFlag The seek flag
     * @returns WebAVPacket[]
     */
    getAVPackets(time: number, seekFlag?: AVSeekFlag): Promise<WebAVPacket[]>;
    /**
     * Returns a `ReadableStream` for streaming packet data.
     * @param start start time in seconds
     * @param end end time in seconds
     * @param streamType The type of media stream
     * @param streamIndex The index of the media stream
     * @param seekFlag The seek flag
     * @returns ReadableStream<WebAVPacket>
     */
    readAVPacket(start?: number, end?: number, streamType?: AVMediaType, streamIndex?: number, seekFlag?: AVSeekFlag): ReadableStream<WebAVPacket>;
    /**
     * Set log level
     * @param level log level
     */
    setLogLevel(level: AVLogLevel): Promise<unknown>;
    /**
     * Get media stream (video, audio or subtitle)
     * @param type The type of media stream ('video', 'audio' or 'subtitle')
     * @param streamIndex The index of the media stream
     * @returns WebAVStream
     */
    getMediaStream(type: MediaType, streamIndex?: number): Promise<WebAVStream>;
    /**
     * Seek media packet at a time point
     * @param type The type of media ('video', 'audio' or 'subtitle')
     * @param time seek time in seconds
     * @param seekFlag The seek flag
     * @returns WebAVPacket
     */
    seekMediaPacket(type: MediaType, time: number, seekFlag?: AVSeekFlag): Promise<WebAVPacket>;
    /**
     * Read media packet as a stream
     * @param type The type of media ('video', 'audio' or 'subtitle')
     * @param start start time in seconds
     * @param end end time in seconds
     * @param seekFlag The seek flag
     * @returns ReadableStream<WebAVPacket>
     */
    readMediaPacket(type: MediaType, start?: number, end?: number, seekFlag?: AVSeekFlag): ReadableStream<WebAVPacket>;
    /**
     * Generate decoder config for video or audio
     * @param type The type of media ('video' or 'audio')
     * @param avStream WebAVStream
     * @returns ExtendedVideoDecoderConfig | AudioDecoderConfig
     */
    genDecoderConfig<T extends WebCodecsSupportedMediaType>(type: T, avStream: WebAVStream): MediaTypeToConfig[T];
    /**
     * Generate encoded chunk for video or audio
     * @param type The type of media ('video' or 'audio')
     * @param avPacket WebAVPacket
     * @returns EncodedVideoChunk | EncodedAudioChunk
     */
    genEncodedChunk<T extends WebCodecsSupportedMediaType>(type: T, avPacket: WebAVPacket): MediaTypeToChunk[T];
    /**
     * Get decoder config for WebCodecs
     * @param type The type of media ('video' or 'audio')
     * @returns Promise<ExtendedVideoDecoderConfig | AudioDecoderConfig>
     */
    getDecoderConfig<T extends WebCodecsSupportedMediaType>(type: T): Promise<MediaTypeToConfig[T]>;
    /**
     * Seek and return encoded chunk for WebCodecs
     * @param type The type of media ('video' or 'audio')
     * @param time time in seconds
     * @param seekFlag The seek flag
     * @returns ReadableStream<EncodedVideoChunk | EncodedAudioChunk>
     */
    seek<T extends WebCodecsSupportedMediaType>(type: T, time: number, seekFlag?: AVSeekFlag): Promise<MediaTypeToChunk[T]>;
    /**
     * Read encoded chunks as a stream for WebCodecs
     * @param type The type of media ('video' or 'audio')
     * @param start start time in seconds
     * @param end end time in seconds
     * @param seekFlag The seek flag
     * @returns ReadableStream<EncodedVideoChunk | EncodedAudioChunk>
     */
    read<T extends WebCodecsSupportedMediaType>(type: T, start?: number, end?: number, seekFlag?: AVSeekFlag): ReadableStream<MediaTypeToChunk[T]>;
}

export declare interface WebDemuxerOptions {
    /**
     * custom wasm file path
     */
    wasmFilePath?: string;
}

export declare interface WebMediaInfo {
    format_name: string;
    start_time: number;
    duration: number;
    bit_rate: string;
    nb_streams: number;
    nb_chapters: number;
    flags: number;
    streams: WebAVStream[];
}

export { }
