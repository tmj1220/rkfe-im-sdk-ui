import React from 'react';
import styles from './fileMessage.less';
import { FileTextOutlined } from '@ant-design/icons';
import { computeFilesize } from '../../utils/file';

interface FileMessageProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  self?: boolean;
}

export default function FileMessage(props: FileMessageProps) {
  return (
    <div
      className={styles.fileMessageCon}
      onClick={() => window.open(props.fileUrl)}
      style={{
        backgroundColor: props.self ? '#d2e4fb' : '#fff',
      }}
    >
      <div className={styles.textContent}>
        <span className={styles.fileName}>{props.fileName}</span>
        <span className={styles.fileSize}>
          {computeFilesize(props.fileSize)}
        </span>
      </div>
      <FileTextOutlined className={styles.fileIcon} />
    </div>
  );
}
