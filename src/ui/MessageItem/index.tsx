import React from 'react';
import { ComponentStyleProps } from '../../types/react';
import { GroupType, Message, MessageType } from '../../types/im';
import styles from './index.less';
import createMessageElement from './createMessageElement';
import { User } from 'rkfe-im-sdk-core/types/im';
import { showDataTime } from '../../utils/date';

export interface MessageItemProps extends ComponentStyleProps {
  message: Message;
  sender: User;
  self: boolean;
  onUnreadClick?: () => void;
  groupType: GroupType;
}

export default function Index(props: MessageItemProps) {
  const { sender, self, message } = props;
  const { messageType } = message;
  // 是否系统消息
  const system = messageType === MessageType.System;
  // 消息摆放位置
  const Detail = createMessageElement(message, self);
  // 详细详情
  if (!Detail) return null;
  return (
    <div
      className={styles.con}
      style={{
        flexDirection: self ? 'row-reverse' : 'row',
        justifyContent:
          messageType === MessageType.System ? 'center' : undefined,
      }}
    >
      {message.messageType !== MessageType.System && (
        <img src={sender?.headPortrait} alt="头像" className={styles.avatar} />
      )}
      <div className={styles.container}>
        {messageType !== MessageType.System && (
          <span
            className={styles.time}
            style={{ alignSelf: self ? 'flex-end' : 'flex-start' }}
          >
            {showDataTime(message.sendTimeLong)}
          </span>
        )}
        <div
          style={{
            alignSelf: system ? 'center' : self ? 'flex-end' : 'flex-start',
          }}
          className={styles.detailContainer}
        >
          {self &&
            !system &&
            (message.unReadCount <= 0 ? (
              <span className={styles.unread}>
                {props.groupType === GroupType.Group ? '全部已读' : '已读'}
              </span>
            ) : (
              <a
                className={styles.unread}
                onClick={(event) => {
                  event.stopPropagation();
                  if (props.onUnreadClick) props.onUnreadClick();
                }}
              >
                {props.groupType === GroupType.Group
                  ? `${message.unReadCount}人未读`
                  : '未读'}
              </a>
            ))}
          {Detail}
        </div>
        {!system && (
          <span
            className={styles.senderName}
            style={{ alignSelf: self ? 'flex-end' : 'flex-start' }}
          >
            {sender?.realName || ''}
          </span>
        )}
      </div>
    </div>
  );
}
