/**
 * 计算文件大小，保留两位小数
 * K: 1024
 * M: 1024 * 1024
 * G: 1024 * 1024 * 1024
 * T: 1024 * 1024 * 1024 * 1024
 * */
export function computeFilesize(bytes: number): string {
  if (typeof bytes !== 'number') return '';
  if (bytes >= Math.pow(1024, 4)) {
    return `${(bytes / Math.pow(1024, 4)).toFixed(2)}T`;
  }
  if (bytes >= Math.pow(1024, 3)) {
    return `${(bytes / Math.pow(1024, 3)).toFixed(2)}G`;
  }
  if (bytes >= Math.pow(1024, 2)) {
    return `${(bytes / Math.pow(1024, 2)).toFixed(2)}M`;
  }
  return `${(bytes / Math.pow(1024, 1)).toFixed(2)}K`;
}
