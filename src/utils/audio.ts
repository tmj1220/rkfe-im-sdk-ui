import { v4 as uuidv4 } from 'uuid';

const audioSingleton: HTMLAudioElement | null = new Audio();
let singleId = '';

// aac 转 mp3，返回
export async function aacToMp3(url: string): Promise<string> {
  // const { createFFmpeg } = FFmpeg;
  // const res = await fetch(url, { mode: 'no-cors' });
  // const sourceBuffer = await res.arrayBuffer();
  //
  // // 创建 FFmpeg 实例并载入
  // const ffmpeg = createFFmpeg({ log: true });
  // await ffmpeg.load();
  //
  // // 把 AVI 写入 FFmpeg 文件系统
  // ffmpeg.FS(
  //   'writeFile',
  //   'input.aac',
  //   new Uint8Array(sourceBuffer, 0, sourceBuffer.byteLength)
  // );
  //
  // // 执行 FFmpeg 命令行工具, 把 AVI 转码为 MP4
  // await ffmpeg.run('-i', 'input.aac', 'output.mp3');
  //
  // // 把 MP4 文件从 FFmpeg 文件系统中取出
  // const output = ffmpeg.FS('readFile', 'output.mp3');
  //
  // return URL.createObjectURL(new Blob([output.buffer], { type: 'audio/mp3' }));

  return Promise.resolve(url);
}

// 新播放返回 uuid；只是暂停返回 ''
export async function playAudio(url: string, id?: string): Promise<string> {
  // 如果是 Chrome 浏览器，播放 aac 格式音频，需要转化
  // const urlSplit = url.split('.');
  // let suffix = '';
  // if (urlSplit && urlSplit.length) {
  //   suffix = urlSplit[urlSplit.length - 1];
  // }
  // if (/chrome/i.exec(navigator.userAgent) && suffix === 'aac') {
  //   url = await aacToMp3(url);
  // }
  // 先停止当前播放
  audioSingleton!.pause();
  if (!id || id !== singleId) {
    // 新播放
    audioSingleton!.src = url;
    audioSingleton!.play();
    const uuid = uuidv4();
    singleId = uuid;
    return uuid;
  }
  return '';
}
