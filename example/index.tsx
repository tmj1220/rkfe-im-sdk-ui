import React, { useEffect, useReducer, useRef } from 'react';
import ReactDOM from 'react-dom';

import { Action, initialMessages, initialState, reducer, State } from './store';
import App from './app';
import ImCore from 'rkfe-im-sdk-core';
import { HTTP, TOKEN_KEY, USER_ID_KEY, WS } from './config';
import { Group, SystemMessageDetail, User } from 'rkfe-im-sdk-core/types/im';
import {
  Message,
  MessageType,
  ReadMessage,
  SystemMessageActionType,
} from '../src/types/im';
import { Modal } from 'antd';

export interface StoreContext {
  state?: State;
  dispatch?: React.Dispatch<Action>;
  action?: {
    init: (token: string, userId: string) => Promise<void>;
    selectGroup: (group: Group) => void;
    loadPageHistoryMessages: () => void;
    updateGroups: (params?: {
      groupId?: string;
      keywords?: string;
    }) => Promise<Group[]>;
    updateGroup: (group: Group) => void;
    updateGroupUsers: (group: Group, users: User[]) => void;
    updateUnreadCount: (readMessage: ReadMessage) => void;
    quitGroup: (group: Group) => void;
    dismissGroup: (group: Group) => void;
    clearGroupUnreadNum: (groupId: string) => void;
  };
}

export const SContext = React.createContext<StoreContext>({});

function Provider() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 用一个 ref 保存 state，保证在初始化注册的各类回调中 state 的最新
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 未读数变化
  const updateUnreadCount = (readMessage: ReadMessage) => {
    if (
      readMessage.receiveGroup &&
      stateRef.current.chat?.group.groupId === readMessage.receiveGroup
    ) {
      dispatch({ type: 'updateReadCount', readMessage });
    }
  };

  // 分页加载历史消息，如果传了 group，说明是对该 group 的第一页加载
  const loadPageHistoryMessages = async (group?: Group) => {
    if (group || state.chat) {
      try {
        const messages = group ? initialMessages : state.chat.messages;
        if (!messages.loadingMore && messages.hasNext) {
          const pageSize = messages.pageSize;
          const nextPage = messages.pageIndex + 1;
          const refreshingTime =
            nextPage === 1 ? Date.now() : messages.refreshingTime;

          dispatch({ type: 'messageLoading', loading: true });
          const list = await ImCore.getSingleton().historyMessage({
            receiveGroup: group?.groupId || state.chat.group.groupId,
            sendTimeLongEnd: refreshingTime,
            pageIndex: nextPage,
            pageSize,
          });
          if (list && list.length) {
            // 对 list 进行排序后拼接回去
            list.sort((a, b) => b.sendTimeLong - a.sendTimeLong);
            dispatch({
              type: 'updateMessage',
              messages: {
                data: messages.data.concat(list),
                refreshingTime,
                pageIndex: nextPage,
                pageSize,
                loadingMore: false,
                hasNext: list && list.length === pageSize,
              },
            });
          }
          dispatch({ type: 'messageLoading', loading: false });
        }
      } catch (e) {
        dispatch({ type: 'messageLoading', loading: false });
        console.log(e);
      }
    }
  };

  // 选中一个群聊
  const selectGroup = async (group: Group) => {
    dispatch({
      type: 'selectGroup',
      group,
    });
    // 加载第一页消息
    await loadPageHistoryMessages(group);
    // 调已读接口
    ImCore.getSingleton().updateRecordTime(group.groupId);
  };

  // 清空未读数
  const clearGroupUnreadNum = (groupId: string) => {
    dispatch({
      type: 'clearUnreadNum',
      groupId,
    });
  };

  // 关键词搜索更新群列表，并选中一个
  const updateGroups = async (params?: {
    groupId?: string;
    keywords?: string;
  }) => {
    const groups = await ImCore.getSingleton().getGroups(
      params?.keywords || ''
    );
    dispatch({
      type: 'uploadGroups',
      groups,
    });
    if (params?.groupId) {
      const group = groups.find((item) => item.groupId === params.groupId);
      if (group) {
        selectGroup(group);
      }
    }
    return groups;
  };

  const reset = () => dispatch({ type: 'reset' });

  // 更新群组
  const updateGroup = (group: Group) => {
    dispatch({
      type: 'updateGroup',
      group,
    });
  };

  // 连接上后的初始化操作
  const initAfterConnect = async (imCore: ImCore, userId: string) => {
    const groups = await imCore.getGroups();
    const contacts = await imCore.getContacts();
    const contactMap: { [key: string]: User } = {};
    if (contacts && contacts.length) {
      contacts.forEach((user) => (contactMap[user.userId] = user));
    }
    dispatch({
      type: 'init',
      state: Object.assign({}, initialState, {
        userId,
        loading: false,
        groups,
        contacts,
        contactMap,
      }),
    });
    if (groups && groups.length) {
      // 选中第一个群
      selectGroup(groups[0]);
    }
  };

  // 初始化
  const init = async (token: string, userId: string) => {
    try {
      dispatch({ type: 'loading', loading: true });
      const imCore = ImCore.getSingleton({
        token,
        ws: WS,
        http: HTTP,
        onMessage,
        onConnect: () => {
          console.log('连接上了');
          // 清空 state 后重新加载
          reset();
          initAfterConnect(imCore, userId);
        },
        onDisconnect: (event) => console.log('断开了', event),
        onError: (e) => console.log('出错了', e),
      });
      await initAfterConnect(imCore, userId);
    } catch (e) {
      console.log(e);
      dispatch({ type: 'loading', loading: false });
    }
  };

  // 更新群成员
  const updateGroupUsers = (group: Group, users: User[]) => {
    updateGroup(Object.assign({}, group, { userList: users }));
  };

  // 退出群聊
  const quitGroup = async (group: Group) => {
    if (state.userId === group.ownerId) {
      // 先看我是不是群主，群主不能退出
      throw new Error('群主不能退出群聊');
    }
    // 相当于踢自己出群
    await ImCore.getSingleton().removeGroupUser({
      groupId: group.groupId,
      userIdList: [state.userId],
    });
    // 更新群列表
    updateGroups();
    // 当前群聊处理
    dispatch({
      type: 'quitGroup',
      group,
    });
  };

  // 解散群
  const dismissGroup = async (group: Group) => {
    if (state.userId !== group.ownerId) {
      // 先看我是不是群主，群主不能退出
      throw new Error('不是群主不能解散群聊');
    }
    await ImCore.getSingleton().dismissGroup(group.groupId);
    // 更新群列表
    updateGroups();
    // 当前群聊处理
    dispatch({
      type: 'quitGroup',
      group,
    });
  };

  // 消息监听
  const onMessage = async (message: Message | ReadMessage) => {
    const currentGroupId = stateRef.current.chat?.group.groupId;
    // todo 整个 onMessage 需要节流，当并发很大时候，需要消息的批处理
    console.log('onMessage:', message);
    if (message.messageType === MessageType.Read) {
      // 已读消息，更新已读数
      updateUnreadCount(message as ReadMessage);
      return;
    }
    if (message.messageType === MessageType.System) {
      // 几个特殊的系统消息处理
      try {
        const detail = JSON.parse(message.messageDetail) as SystemMessageDetail;
        if (detail.msgAction === SystemMessageActionType.Logout) {
          const reLogin = () => {
            ImCore.getSingleton().destroy();
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(TOKEN_KEY);
            window.location.reload();
          };
          Modal.confirm({
            title: '被踢下线',
            content: '账号在其他地方登录，请重新登录',
            cancelText: '不能取消',
            okText: '重新登录',
            onOk: reLogin,
            onCancel: reLogin,
          });
          return;
        }
        if (
          detail.msgAction === SystemMessageActionType.InviteInGroup ||
          detail.msgAction === SystemMessageActionType.AddGroup ||
          detail.msgAction === SystemMessageActionType.OutOfGroup ||
          detail.msgAction === SystemMessageActionType.QuitGroup
        ) {
          // 被邀请入群、新增群、被踢出群、退出群 时，更新群列表
          // ----------
          // 创建群后，群主 和 其他群成员都能收到创建群的消息（但是群的创建者的处理跟这里不同，在创建逻辑那里做了）
          const newGroups = await updateGroups();
          const addUserGroupId = message.receiveGroup;
          const addUserGroup = newGroups.find(
            (group) => group.groupId === addUserGroupId
          );
          if (addUserGroup) {
            dispatch({
              type: 'updateGroup',
              group: addUserGroup,
            });
          }
        }
        if (detail.msgAction === SystemMessageActionType.DismissGroup) {
          dispatch({
            type: 'dismissGroup',
            groupId: message.receiveGroup,
          });
          return;
        }
        if (detail.msgAction === SystemMessageActionType.OutOfGroup) {
          const updatedGroups = await updateGroups();
          const outGroupId = message.receiveGroup;
          const outGroup = updatedGroups.find(
            (group) => group.groupId === outGroupId
          );
          if (outGroup) {
            // 还能找到这个群，说明被退的不是自己，更新群就可以
            dispatch({
              type: 'updateGroup',
              group: outGroup,
            });
          } else {
            // 找不到这个群，说明被退的是自己，退出群
            dispatch({
              type: 'outGroup',
              groupId: outGroupId,
            });
            if (currentGroupId === outGroupId) {
              console.log('进来了');
              // 如果是当前群聊，弹框提醒一下，并直接 return
              Modal.confirm({
                title: '退群提醒',
                content: '您被移出当前群聊',
                okText: '确认',
                cancelText: '好的',
              });
              return;
            }
          }
        }
        if (detail.msgAction === SystemMessageActionType.GroupInfoChanged) {
          // 修改群信息，和入群做相同的操作
          const newGroups = await updateGroups();
          const updatedGroupId = message.receiveGroup;
          const updatedGroup = newGroups.find(
            (group) => group.groupId === updatedGroupId
          );
          dispatch({
            type: 'updateGroup',
            group: updatedGroup,
          });
        }
      } catch (e) {
        console.log(e);
        return;
      }
    }

    // 聊天消息（包括系统消息）
    const msg = message as Message;
    if (currentGroupId && currentGroupId === msg?.receiveGroup) {
      // --- 当前群聊收到消息 ---
      // 标记已读
      ImCore.getSingleton().updateRecordTime(currentGroupId);
      const userLength = stateRef.current.chat.group.userList?.length;
      // 未读人数不包含自己
      msg.unReadCount = userLength ? userLength - 1 : 0;
      // 直接添加到列表
      dispatch({
        type: 'currentSessionAddMessage',
        message: msg,
      });
    } else {
      dispatch({
        type: 'groupUpdateLastMessage',
        message: msg,
      });
    }
  };

  const action = {
    init,
    selectGroup,
    loadPageHistoryMessages,
    updateGroups,
    updateGroup,
    updateGroupUsers,
    updateUnreadCount,
    quitGroup,
    dismissGroup,
    clearGroupUnreadNum,
  };

  return (
    <SContext.Provider value={{ state, dispatch, action }}>
      <App />
    </SContext.Provider>
  );
}

ReactDOM.render(<Provider />, document.getElementById('root'));
