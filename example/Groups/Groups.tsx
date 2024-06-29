import React, { useContext } from 'react';
import { SContext, StoreContext } from '../index';
import { Avatar, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { Group } from 'rkfe-im-sdk-core/types/im';
import styles from './index.less';
import {
  MessageDetail,
  MessageType,
  TextMessageDetail,
  GroupType,
} from '../../src/types/im';
import { showDataTime } from '../../src/utils/date';

export default function () {
  const { state, action }: StoreContext = useContext(SContext);
  return (
    <List className={styles.container}>
      <VirtualList
        data={state.groups.slice().sort((a, b) => {
          const aT = a.lastMessage?.sendTimeLong || 0;
          const bT = b.lastMessage?.sendTimeLong || 0;
          return bT - aT;
        })}
        // 60 是搜索区域高度
        height={document.body.clientHeight - 60}
        itemHeight={73}
        itemKey="groupId"
      >
        {(item: Group) => {
          // 最后消息
          let lastMessageStr = '';
          let lastTimeStr = '';
          if (item.lastMessage) {
            const lastMessage = item.lastMessage;
            lastTimeStr = showDataTime(lastMessage.sendTimeLong);
            lastMessageStr += `${
              state.contactMap[lastMessage?.sender || '']?.realName
            }：`;
            try {
              // 不同类型消息处理
              const detail: MessageDetail = JSON.parse(
                lastMessage.messageDetail
              );
              switch (lastMessage.messageType) {
                case MessageType.Text:
                  const textDetail = detail as TextMessageDetail;
                  lastMessageStr += `${textDetail.content}`;
                  break;
                case MessageType.Image:
                  lastMessageStr += '[图片]';
                  break;
                case MessageType.Video:
                  lastMessageStr += '[视频]';
                  break;
                case MessageType.File:
                  lastMessageStr += '[文件]';
                  break;
                case MessageType.Voice:
                  lastMessageStr += '[语音]';
                  break;
                case MessageType.System:
                  lastMessageStr += '[系统消息]';
                  break;
                default:
                  break;
              }
            } catch (e) {
              console.log('消息解析出错！');
            }
          }
          // 群头像/名称：群聊-取群聊头像/名称；单聊-取对方头像/名字
          const avatar =
            item.groupType === GroupType.Group
              ? item.groupAvatars
              : item.userList.find((user) => user.userId !== state.userId)
                  ?.headPortrait;
          const name =
            item.groupType === GroupType.Group
              ? item.groupName
              : item.userList.find((user) => user.userId !== state.userId)
                  ?.realName;
          return (
            <List.Item
              key={item.groupId}
              className={styles.item}
              style={{
                backgroundColor:
                  state.chat?.group?.groupId === item.groupId
                    ? '#e8eaed'
                    : '#ffffff',
              }}
              onClick={() => {
                if (item.groupId !== state.chat?.group.groupId) {
                  action.selectGroup(item);
                }
              }}
            >
              <List.Item.Meta
                avatar={<Avatar src={avatar} />}
                title={<p className={styles.text}>{name}</p>}
                description={
                  <p className={styles.text}>{lastMessageStr || '暂无消息'}</p>
                }
              />
              <span className={styles.time}>
                {!!item.unReadCount && item.unReadCount > 0 && (
                  <span className={styles.unReadCount}>{item.unReadCount}</span>
                )}
                {lastTimeStr}
              </span>
            </List.Item>
          );
        }}
      </VirtualList>
    </List>
  );
}
