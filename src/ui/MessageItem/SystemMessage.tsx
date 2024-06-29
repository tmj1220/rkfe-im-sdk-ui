import React from 'react';
import styles from './systemMessage.less';
import { SystemMessageActionType } from '../../types/im';

interface SystemMessageProps {
  content: string;
  msgAction: SystemMessageActionType;
}

export function SystemMessage(props: SystemMessageProps) {
  if (props.msgAction === SystemMessageActionType.GroupInfoChanged) {
    // 修改群信息，固定返回
    return <span className={styles.systemMessage}>修改群信息</span>;
  }
  return <span className={styles.systemMessage}>{props.content}</span>;
}
