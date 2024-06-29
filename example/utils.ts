export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!/audio/.exec(file.type)) {
      throw new Error('非音频文件不能获取时长');
    }
    const src = URL.createObjectURL(file);
    let audio = document.createElement('audio');
    const dismiss = () => {
      URL.revokeObjectURL(src);
      audio = null;
    };
    audio.src = src;
    audio.onloadedmetadata = () => {
      if (audio.duration === Infinity) {
        // chrome 会返回 Infinity，通过下面的技巧拿到时间
        audio.currentTime = 1e101;
        audio.ontimeupdate = function () {
          resolve(audio.duration);
          dismiss();
        };
      } else {
        resolve(audio.duration);
        dismiss();
      }
    };
    audio.onerror = (error) => {
      reject(error);
      dismiss();
    };
  });
}

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
