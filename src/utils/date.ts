// 个位数前面补0
function patch0(num: number): string {
  return num >= -9 && num <= 9 ? `0${num}` : num.toString();
}

/**
 * 显示时间：
 * 今天：时分
 * 昨天：昨天
 * 前天：前天
 * 今年：月日
 * 往年：年月日
 * */
export function showDataTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const nowDate = new Date();
  const nowYear = nowDate.getFullYear();
  const nowMonth = nowDate.getMonth() + 1;
  const nowDay = nowDate.getDate();

  if (year === nowYear) {
    if (month === nowMonth) {
      if (day === nowDay) {
        return `${patch0(hour)}:${patch0(minute)}`;
      } else if (day === nowDay - 1) {
        return '昨天';
      } else if (day === nowDay - 2) {
        return '前天';
      }
    }
    return `${patch0(month)}/${patch0(day)}`;
  }
  return `${patch0(year)}/${patch0(month)}/${patch0(day)}`;
}

showDataTime(1616041209000);
