import React, { useRef } from 'react';
import styles from './voiceMessage.less';
import { playAudio } from '../../utils/audio';
import { WifiOutlined } from '@ant-design/icons';

interface VoiceMessageProps {
  voiceUrl: string;
  duration: number;
  // 是否是自己的消息，默认非自己的
  self?: boolean;
}
export default function VoiceMessage(props: VoiceMessageProps) {
  const playId = useRef('');
  const play = async () => {
    playId.current = await playAudio(props.voiceUrl, playId.current);
  };
  return (
    <div
      className={styles.voiceMessageCon}
      style={{
        backgroundColor: props.self ? '#d2e4fb' : '#ffffff',
        flexDirection: props.self ? 'row' : 'row-reverse',
        justifyContent: self ? 'flex-end' : 'flex-start',
      }}
      onClick={() => play()}
    >
      {props.duration && (
        <span className={styles.voiceTipText}>
          {parseInt(props.duration.toString())}″
        </span>
      )}
      <div style={{ width: 14 }} />
      <WifiOutlined
        className={styles.voiceTipText}
        style={{
          transform: 'rotate(90deg)',
        }}
      />
    </div>
  );
}
