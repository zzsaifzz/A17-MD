 const play = require('play-dl');
 const yts = require('youtube-yts');
 const readline = require('readline');
 const ffmpeg = require('fluent-ffmpeg')
 const NodeID3 = require('node-id3')
 const fs = require('fs');
 const { fetchBuffer } = require("./Function")
 const ytM = require('node-youtube-music')
 const { randomBytes } = require('crypto')
 const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
 
 class YT {
     constructor() { }
 
     /**
      * Checks if it is yt link
      * @param {string|URL} url youtube url
      * @returns Returns true if the given YouTube URL.
      */
     static isYTUrl = (url) => {
         return ytIdRegex.test(url)
     }
 
     /**
      * VideoID from url
      * @param {string|URL} url to get videoID
      * @returns 
      */
     static getVideoID = (url) => {
         if (!this.isYTUrl(url)) throw new Error('is not YouTube URL')
         return ytIdRegex.exec(url)[1]
     }
 
     /**
      * @typedef {Object} IMetadata
      * @property {string} Title track title
      * @property {string} Artist track Artist
      * @property {string} Image track thumbnail url
      * @property {string} Album track album
      * @property {string} Year track release date
      */
 
     /**
      * Write Track Tag Metadata
      * @param {string} filePath 
      * @param {IMetadata} Metadata 
      */
     static WriteTags = async (filePath, Metadata) => {
         NodeID3.write(
             {
                 title: Metadata.Title,
                 artist: Metadata.Artist,
                 originalArtist: Metadata.Artist,
                 image: {
                     mime: 'jpeg',
                     type: {
                         id: 3,
                         name: 'front cover',
                     },
                     imageBuffer: (await fetchBuffer(Metadata.Image)).buffer,
                     description: `Cover of ${Metadata.Title}`,
                 },
                 album: Metadata.Album,
                 year: Metadata.Year || ''
             },
             filePath
         );
     }
 
     /**
      * 
      * @param {string} query 
      * @returns 
      */
     static search = async (query, options = {}) => {
         const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options })
         return search.videos
     }
 
     /**
      * @typedef {Object} TrackSearchResult
      * @property {boolean} isYtMusic is from YT Music search?
      * @property {string} title music title
      * @property {string} artist music artist
      * @property {string} id YouTube ID
      * @property {string} url YouTube URL
      * @property {string} album music album
      * @property {Object} duration music duration {seconds, label}
      * @property {string} image Cover Art
      */
 
     /**
      * search track with details
      * @param {string} query 
      * @returns {Promise<TrackSearchResult[]>}
      */
     static searchTrack = (query) => {
         return new Promise(async (resolve, reject) => {
             try {
                 let ytMusic = await ytM.searchMusics(query);
                 let result = []
                 for (let i = 0; i < ytMusic.length; i++) {
                     result.push({
                         isYtMusic: true,
                         title: `${ytMusic[i].title} - ${ytMusic[i].artists.map(x => x.name).join(' ')}`,
                         artist: ytMusic[i].artists.map(x => x.name).join(' '),
                         id: ytMusic[i].youtubeId,
                         url: 'https://youtu.be/' + ytMusic[i].youtubeId,
                         album: ytMusic[i].album,
                         duration: {
                             seconds: ytMusic[i].duration.totalSeconds,
                             label: ytMusic[i].duration.label
                         },
                         image: ytMusic[i].thumbnailUrl.replace('w120-h120', 'w600-h600')
                     })
                  
                 }
                 resolve(result)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     /**
      * @typedef {Object} MusicResult
      * @property {TrackSearchResult} meta music meta
      * @property {string} path file path
      */
 
     /**
      * Download music with full tag metadata
      * @param {string|TrackSearchResult[]} query title of track want to download
      * @returns {Promise<MusicResult>} filepath of the result
      */
     static downloadMusic = async (query) => {
         try {
             const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
             const search = getTrack[0]//await this.searchTrack(query)
            const videoInfo = await play.video_basic_info('https://www.youtube.com/watch?v=' + search.id);
            const { stream } = await play.stream('https://www.youtube.com/watch?v=' + search.id, { quality: 140 });
            let songPath = `./storage/${randomBytes(3).toString('hex')}.mp3`
             stream.on('error', (err) => console.log(err))
 
             const file = await new Promise((resolve) => {
                 ffmpeg(stream)
                     .audioFrequency(44100)
                     .audioChannels(2)
                     .audioBitrate(128)
                     .audioCodec('libmp3lame')
                     .audioQuality(5)
                     .toFormat('mp3')
                     .save(songPath)
                     .on('end', () => resolve(songPath))
             });
            await this.WriteTags(file, { Title: search.title, Artist: search.artist, Image: search.image, Album: search.album, Year: videoInfo.video_details.uploaded_at.split('-')[0] });
             return {
                 meta: search,
                 path: file,
                 size: fs.statSync(songPath).size
             }
         } catch (error) {
             throw new Error(error)
         }
     }
 
     /**
      * get downloadable video urls
      * @param {string|URL} query videoID or YouTube URL
      * @param {string} quality 
      * @returns
      */
     static mp4 = async (query, quality = 134) => {
         try {
             if (!query) throw new Error('Video ID or YouTube Url is required')
             const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query
            const videoInfo = await play.video_basic_info('https://www.youtube.com/watch?v=' + videoId);
            const format = videoInfo.format.filter(f => f.itag == quality && f.hasVideo && f.hasAudio)[0] || videoInfo.format[0];
            return {
                title: videoInfo.video_details.title,
                thumb: videoInfo.video_details.thumbnails.slice(-1)[0],
                date: videoInfo.video_details.uploaded_at,
                duration: videoInfo.video_details.durationInSec,
                channel: videoInfo.video_details.channel,
                quality: format.qualityLabel || quality,
                contentLength: format.contentLength || 0,
                description: videoInfo.video_details.description,
                videoUrl: format.url
            }
         } catch (error) {
             throw error
         }
     }
 
     /**
      * Download YouTube to mp3
      * @param {string|URL} url YouTube link want to download to mp3
      * @param {IMetadata} metadata track metadata
      * @param {boolean} autoWriteTags if set true, it will auto write tags meta following the YouTube info
      * @returns 
      */
     static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
         try {
             if (!url) throw new Error('Video ID or YouTube Url is required')
             url = this.isYTUrl(url) ? 'https://www.youtube.com/watch?v=' + this.getVideoID(url) : url
            const { video_details } = await play.video_basic_info(url);
            const { stream } = await play.stream(url, { quality: 140 });
            let songPath = `./storage/${randomBytes(3).toString('hex')}.mp3`
 
             let starttime;
             stream.once('response', () => {
                 starttime = Date.now();
             });
            // play-dl streams do not emit progress events
            stream.on('end', () => process.stdout.write('\n\n'));
            stream.on('error', (err) => console.log(err))
 
             const file = await new Promise((resolve) => {
                 ffmpeg(stream)
                     .audioFrequency(44100)
                     .audioChannels(2)
                     .audioBitrate(128)
                     .audioCodec('libmp3lame')
                     .audioQuality(5)
                     .toFormat('mp3')
                     .save(songPath)
                     .on('end', () => {
                         resolve(songPath)
                     })
             });
             if (Object.keys(metadata).length !== 0) {
                 await this.WriteTags(file, metadata)
             }
            if (autoWriteTags) {
                await this.WriteTags(file, { Title: video_details.title, Album: video_details.channel, Year: video_details.uploaded_at.split('-')[0], Image: video_details.thumbnails.slice(-1)[0].url })
            }
            return {
                meta: {
                    title: video_details.title,
                    channel: video_details.channel,
                    seconds: video_details.durationInSec,
                    image: video_details.thumbnails.slice(-1)[0].url
                },
                 path: file,
                 size: fs.statSync(songPath).size
             }
         } catch (error) {
             throw error
         }
     }
 }
 
 module.exports = YT;
