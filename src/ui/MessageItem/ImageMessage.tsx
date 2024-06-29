import React from 'react';
import styles from './imageMessage.less';

interface ImageMessageProps {
  imgUrl: string;
  thumbUrl: string;
  imgWidth: number | string;
  imgHeight: number | string;
  thumbWidth?: number;
}
export default function ImageMessage(props: ImageMessageProps) {
  const { imgWidth, imgHeight } = props;

  const width = props.thumbWidth || 225;
  let height = 150;
  if (imgWidth && imgHeight) {
    try {
      const w = typeof imgWidth === 'string' ? parseInt(imgWidth) : imgWidth;
      const h = typeof imgHeight === 'string' ? parseInt(imgHeight) : imgHeight;
      height = (h * width) / w;
    } catch (e) {}
  }
  return (
    <div>
      <img
        className={styles.imageMessage}
        style={{
          width,
          height,
        }}
        src={props.thumbUrl}
        alt="图片消息"
      />
    </div>
  );
}
