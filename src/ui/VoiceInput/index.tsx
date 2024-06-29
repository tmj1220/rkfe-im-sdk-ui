import React, { useRef, useState } from 'react';
import styles from './index.less';
import { AudioOutlined } from '@ant-design/icons';

export interface VoiceInputProps {
  onRecord?: (voice: File) => void;
  onError?: (error: Error) => void;
}

export default function Index(props: VoiceInputProps) {
  const [recording, setRecording] = useState(false);

  const voiceStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const bufferRef = useRef<Blob[]>([]);
  const activeRef = useRef<boolean>(false);

  const clear = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (voiceStreamRef.current) {
      voiceStreamRef.current.getTracks().forEach((track) => track.stop());
      voiceStreamRef.current = null;
    }
    bufferRef.current = [];
    setRecording(false);
  };

  const onMouseDown = () => {
    activeRef.current = true;
    clear();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((voiceStream) => {
        setRecording(true);
        voiceStreamRef.current = voiceStream;
        if (activeRef.current) {
          voiceStreamRef.current = voiceStream;
          mediaRecorderRef.current = new MediaRecorder(voiceStream, {
            mimeType: 'audio/webm',
          });
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event && event.data && event.data.size > 0)
              bufferRef.current.push(event.data);
          };
          mediaRecorderRef.current.onerror = (event) => {
            if (props.onError) props.onError(event.error);
          };
          mediaRecorderRef.current.start(10);
        } else {
          clear();
        }
      })
      .catch((error) => {
        clear();
        if (props.onError) props.onError(error);
      });
  };

  const onMouseUp = () => {
    activeRef.current = false;

    if (bufferRef.current && bufferRef.current.length > 0) {
      const file = new File(bufferRef.current, 'voice.webm', {
        type: 'audio/webm',
      });
      if (props.onRecord) {
        props.onRecord(file);
      }
    }

    clear();
  };

  return (
    <div
      className={styles.container}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        background: recording ? '#ccc' : 'transparent',
      }}
    >
      <AudioOutlined className={styles.icon} />
      <span className={styles.text}>
        {recording ? '松开 结束' : '按住 说话'}
      </span>
    </div>
  );
}
