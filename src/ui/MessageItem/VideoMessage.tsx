import React from 'react';
import styles from './videoMessage.less';
// todo 需要确认下：支持 tree shaking，引入 antd/icon 是否有问题
import { PlayCircleOutlined } from '@ant-design/icons';

interface VideoMessageProps {
  videoUrl: string;
  thumbUrl: string;
  videoWidth: string | number;
  videoHeight: string | number;
  duration: string | number;
  thumbWidth?: number;
}
export default function VideoMessage(props: VideoMessageProps) {
  const { videoWidth, videoHeight } = props;

  const width = props.thumbWidth || 225;
  let height = 150;
  if (videoWidth && videoHeight) {
    try {
      const w =
        typeof videoWidth === 'string' ? parseInt(videoWidth) : videoWidth;
      const h =
        typeof videoHeight === 'string' ? parseInt(videoHeight) : videoHeight;
      height = (h * width) / w;
    } catch (e) {}
  }

  return (
    <div className={styles.videoMessageCon}>
      <img
        className={styles.videoThumb}
        style={{
          width,
          height,
        }}
        src={props.thumbUrl}
        alt="视频封面"
      />
      <PlayCircleOutlined className={styles.playIcon} />
    </div>
  );
}
