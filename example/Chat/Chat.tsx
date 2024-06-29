import React, { useContext, useState } from 'react';
import styles from './index.less';
import { SContext, StoreContext } from '../index';
import { EllipsisOutlined } from '@ant-design/icons';
import { MessageItem, MessageList } from '../../src';
import { Divider, Drawer, List, Modal, Spin } from 'antd';
import GroupDetail from '../GroupDetail/GroupDetail';
import {
  FileMessageDetail,
  ImageMessageDetail,
  Message,
  SystemMessageDetail,
  VideoMessageDetail,
} from 'rkfe-im-sdk-core/types/im';
import { useRequest } from 'ahooks';
import ImCore from 'rkfe-im-sdk-core';
import { ReadUnreadUsers } from 'rkfe-im-sdk-core/types/api';
import {
  GroupType,
  MessageType,
  SystemMessageActionType,
} from '../../src/types/im';

export default function Chat() {
  const { state, action, dispatch }: StoreContext = useContext(SContext);

  const [groupDetailVisible, setGroupVisible] = useState(false);

  const [showUnreadUser, setShowUnreadUser] = useState(false);

  const {
    data: readUnreadUsers,
    loading: unReadUserLoading,
    run: loadReadUnreadUsers,
  } = useRequest<ReadUnreadUsers, [string]>(
    async (messageId: string) => {
      return ImCore.getSingleton().groupMessageReadUnreadUsers({
        groupId: state.chat.group.groupId,
        messageId,
      });
    },
    { manual: true }
  );

  if (!state.chat) {
    return <div className={styles.container} />;
  }

  // 消息点击
  const onMessageClick = (message: Message) => {
    if (
      message.messageType === MessageType.Image ||
      message.messageType === MessageType.Video
    ) {
      previewMedia(message);
    } else if (message.messageType === MessageType.File) {
      try {
        const detail: FileMessageDetail = JSON.parse(message.messageDetail);
        window.open(detail.fileUrl);
      } catch (e) {}
    }
  };

  // 64：组名部分   242：消息输入部分
  const messageListHeight = document.body.offsetHeight - 64 - 242;
  // 文字消息最小是 84
  const itemHeight = 84;

  const onTopReached = () => {
    action.loadPageHistoryMessages();
  };

  const onMessageUnreadClick = (message: Message) => {
    setShowUnreadUser(true);
    loadReadUnreadUsers(message.id.toString());
  };

  const previewMedia = (previewMessage: Message) => {
    // 大图链接
    let isImage =
      previewMessage && previewMessage.messageType === MessageType.Image;
    let imgUrl = '';
    if (isImage) {
      try {
        imgUrl = (
          JSON.parse(previewMessage.messageDetail) as ImageMessageDetail
        ).imgUrl;
      } catch (e) {
        console.log(e);
      }
      dispatch({
        type: 'previewMedia',
        mediaType: MessageType.Image,
        url: imgUrl,
      });
    }
    let isVideo =
      previewMessage && previewMessage.messageType === MessageType.Video;
    let videoUrl = '';
    if (isVideo) {
      try {
        videoUrl = (
          JSON.parse(previewMessage.messageDetail) as VideoMessageDetail
        ).videoUrl;
      } catch (e) {
        console.log(e);
      }
      dispatch({
        type: 'previewMedia',
        mediaType: MessageType.Video,
        url: videoUrl,
      });
    }
  };

  const chatGroup = state.chat.group;
  // 群名称：群聊-取群聊名称；单聊-取对方名字
  const groupName =
    chatGroup.groupType === GroupType.Group
      ? chatGroup.groupName
      : chatGroup.userList.find((user) => user.userId !== state.userId)
          ?.realName;

  // 对邀请入群和移出群的系统消息的特殊处理
  const handleInviteOrOutGroupSys = (message: Message) => {
    if (message.messageType === MessageType.System) {
      try {
        const detail: SystemMessageDetail = JSON.parse(
          message.messageDetail
        ) as SystemMessageDetail;
        if (
          detail.msgAction === SystemMessageActionType.InviteInGroup ||
          detail.msgAction === SystemMessageActionType.OutOfGroup ||
          detail.msgAction === SystemMessageActionType.QuitGroup
        ) {
          // 邀请入群 和 移除群 和 退群 需要把进/出群的人名称显示出来
          const userIdList = detail.userIdList;
          if (userIdList && userIdList.length) {
            const names: string[] = userIdList.map((userId) => {
              return state.contactMap[userId]?.realName || '';
            });
            const nameDes = names.join('、');
            detail.content =
              detail.msgAction === SystemMessageActionType.InviteInGroup
                ? `邀请${nameDes}加入群聊`
                : detail.msgAction === SystemMessageActionType.OutOfGroup
                ? `${nameDes}被移出群聊`
                : `${nameDes}退出群聊`;

            message.messageDetail = JSON.stringify(detail);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <span className={styles.title}>{groupName}</span>
        {state.chat.group.groupType === GroupType.Group && (
          <EllipsisOutlined
            className={styles.icon}
            onClick={() => setGroupVisible(true)}
          />
        )}
      </div>
      <Spin size={'large'} spinning={state.chat.messages.loadingMore}>
        <MessageList
          className={styles.messageList}
          messages={state.chat.messages.data.slice().reverse()}
          height={messageListHeight}
          renderItem={(item, index) => {
            handleInviteOrOutGroupSys(item);
            return (
              <div onClick={() => onMessageClick(item)}>
                <MessageItem
                  message={item}
                  sender={state.contactMap[item.sender || '']}
                  self={state.userId === item.sender}
                  onUnreadClick={() => {
                    onMessageUnreadClick(item);
                  }}
                  groupType={state.chat.group.groupType}
                />
              </div>
            );
          }}
          itemHeight={itemHeight}
          itemKey="id"
          onTopReached={onTopReached}
          onTopReachedThreshold={10}
          listHeaderComponent={
            state.chat.messages.hasNext ? (
              <span className={styles.pageTip}>历史消息加载中...</span>
            ) : (
              <span className={styles.pageTip}>--- 没有历史消息了 ---</span>
            )
          }
        />
      </Spin>
      <Drawer
        title="群详情"
        placement="right"
        onClose={() => setGroupVisible(false)}
        visible={groupDetailVisible}
        destroyOnClose
        width={520}
      >
        <GroupDetail />
      </Drawer>
      <Modal
        title="消息已读未读成员"
        visible={showUnreadUser}
        okText="确认"
        cancelText="取消"
        onCancel={() => setShowUnreadUser(false)}
        onOk={() => setShowUnreadUser(false)}
      >
        <Spin spinning={unReadUserLoading}>
          <div className={styles.readUnreadArea}>
            <UserList
              users={(readUnreadUsers?.readUserList || []).filter(
                (item) => item !== state.userId
              )}
              title={'已读列表'}
            />
            <Divider type={'vertical'} />
            <UserList
              users={(readUnreadUsers?.unReadUserList || []).filter(
                (item) => item !== state.userId
              )}
              title={'未读列表'}
            />
          </div>
        </Spin>
      </Modal>
    </div>
  );
}

const UserList = (props: { users: string[]; title: string }) => {
  const { state }: StoreContext = useContext(SContext);

  return (
    <div style={{ flex: 1 }}>
      <List
        header={<span>{props.title}</span>}
        bordered
        dataSource={props.users}
        renderItem={(item) => (
          <List.Item>{state.contactMap[item]?.realName}</List.Item>
        )}
      />
    </div>
  );
};
