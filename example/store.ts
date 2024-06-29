import { Group, Message, ReadMessage, User } from 'rkfe-im-sdk-core/types/im';
import { MessageType } from '../src/types/im';

export interface Messages {
  data: Message[];
  refreshingTime: number;
  pageIndex: number;
  pageSize: number;
  loadingMore: boolean;
  hasNext: boolean;
}

export interface Chat {
  group?: Group;
  messages?: Messages;
  fileUploading?: boolean;
}

// 左侧显示 会话/好友
export enum ShowType {
  Session,
  Users,
}

export interface State {
  userId: string;
  loading: boolean;
  showType: ShowType;
  groups: Group[];
  contacts: User[];
  // { id: User } 类型的 map，方便操作
  contactMap: { [key: string]: User };
  chat?: Chat;
  messageSearchVisible?: boolean;
  // 视频 图片的预览
  previewMedia?: {
    mediaType: MessageType.Image | MessageType.Video;
    url: string;
  };
}

export const initialMessages: Messages = {
  data: [],
  refreshingTime: 0,
  pageIndex: 0,
  pageSize: 20,
  loadingMore: false,
  hasNext: true,
};

export const initialState: State = {
  userId: '',
  loading: false,
  showType: ShowType.Session,
  groups: [],
  contacts: [],
  contactMap: {},
  chat: undefined,
};

export interface LoadingAction {
  type: 'loading';
  loading: boolean;
}
export interface InitAction {
  type: 'init';
  state: State;
}
// 选择一个群聊
export interface SelectGroupAction {
  type: 'selectGroup';
  group: Group;
}
export interface MessageLoadingAction {
  type: 'messageLoading';
  loading: boolean;
}
export interface UpdateMessagesAction {
  type: 'updateMessage';
  messages: Messages;
}
// 当前群聊添加消息，同时更新左侧列表的 lastMessage
export interface currentSessionAddMessageAction {
  type: 'currentSessionAddMessage';
  message: Message;
}
// 左侧群聊列表，更新 lastMessage 和 未读数
export interface groupUpdateLastMessageAction {
  type: 'groupUpdateLastMessage';
  message: Message;
}
// 是否正在上传文件
export interface uploadingFileAction {
  type: 'uploadingFile';
  uploading: boolean;
}
// 刷新群聊列表
export interface uploadingGroupsAction {
  type: 'uploadGroups';
  groups: Group[];
}
// 更新群，列表中的（如果该群是当前会话，同时更新）
export interface updateGroupAction {
  type: 'updateGroup';
  group: Group;
}
// 自己被退群
export interface outGroupAction {
  type: 'outGroup';
  groupId: string;
}
// 更新当前群聊消息的已读数
export interface updateReadCountAction {
  type: 'updateReadCount';
  readMessage: ReadMessage;
}
// 聊天消息搜索框
export interface MessageSearchVisibleAction {
  type: 'messageSearchVisible';
  visible: boolean;
}
// 退出群聊
export interface QuitGroupAction {
  type: 'quitGroup';
  group: Group;
}
// 解散群
export interface DismissGroupAction {
  type: 'dismissGroup';
  groupId: string;
}
// 预览或关闭 视频 图片，如果 url 是 null，表示关闭预览
export interface PreviewMediaAction {
  type: 'previewMedia';
  mediaType: MessageType.Image | MessageType.Video;
  url: string | null;
}
// 重置状态
export interface ResetAction {
  type: 'reset';
}
// 清空未读数
export interface ClearUnreadNum {
  type: 'clearUnreadNum';
  groupId: string;
}
// 切换 会话列表/用户列表
export interface ChangeShowTypeAction {
  type: 'changeShowType';
  showType: ShowType;
}

export type Action =
  | LoadingAction
  | InitAction
  | SelectGroupAction
  | MessageLoadingAction
  | UpdateMessagesAction
  | currentSessionAddMessageAction
  | groupUpdateLastMessageAction
  | uploadingFileAction
  | uploadingGroupsAction
  | updateGroupAction
  | outGroupAction
  | updateReadCountAction
  | MessageSearchVisibleAction
  | QuitGroupAction
  | DismissGroupAction
  | PreviewMediaAction
  | ResetAction
  | ClearUnreadNum
  | ChangeShowTypeAction;

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'loading':
      return Object.assign({}, state, { loading: action.loading });
    case 'init':
      return action.state;
    case 'selectGroup':
      return Object.assign({}, state, {
        groups: (state.groups || []).map((item) => {
          if (item.groupId !== action.group.groupId) return item;
          return Object.assign({}, item, {
            // 选中后全部已读
            unReadCount: 0,
          });
        }),
        chat: {
          group: action.group,
          messages: initialMessages,
          fileUploading: false,
        },
      });
    case 'messageLoading':
      return Object.assign({}, state, {
        chat: {
          group: state.chat.group,
          messages: Object.assign({}, state.chat.messages, {
            loadingMore: action.loading,
          }),
          fileUploading: state.chat.fileUploading,
        },
      });
    case 'updateMessage':
      return Object.assign({}, state, {
        chat: {
          group: state.chat.group,
          messages: action.messages,
          fileUploading: state.chat.fileUploading,
        },
      });
    case 'currentSessionAddMessage':
      return Object.assign({}, state, {
        groups: state.groups.map((item) =>
          item.groupId === state.chat.group.groupId
            ? Object.assign({}, item, {
                lastMessage: action.message,
              })
            : item
        ),
        chat: {
          group: state.chat.group,
          messages: Object.assign({}, state.chat.messages, {
            data: [action.message].concat(state.chat.messages.data),
          }),
          fileUploading: state.chat.fileUploading,
        },
      });
    case 'groupUpdateLastMessage':
      return Object.assign({}, state, {
        groups: state.groups.map((item) =>
          item.groupId === action.message.receiveGroup
            ? Object.assign({}, item, {
                lastMessage: action.message,
                unReadCount: (item.unReadCount || 0) + 1,
              })
            : item
        ),
      });
    case 'uploadingFile':
      return Object.assign({}, state, {
        chat: Object.assign({}, state.chat, {
          fileUploading: action.uploading,
        }),
      });
    case 'uploadGroups':
      let uploadGroups = action.groups;
      if (state.chat?.group?.groupId) {
        // 如果当前是有选中状态，选中群聊的未读数置空
        for (const group of uploadGroups) {
          if (group.groupId === state.chat.group.groupId) {
            group.unReadCount = 0;
            break;
          }
        }
      }
      return Object.assign({}, state, {
        groups: uploadGroups,
      });
    case 'updateGroup':
      const newState = Object.assign({}, state, {
        groups: state.groups.map((item) =>
          item.groupId === action.group.groupId ? action.group : item
        ),
      });
      // 如果是当前群聊
      if (state.chat && state.chat.group.groupId === action.group.groupId) {
        newState.chat.group = action.group;
      }
      return newState;
    case 'outGroup':
      const newState2 = Object.assign({}, state, {
        groups: state.groups.filter((item) => item.groupId !== action.groupId),
      });
      if (newState2.chat?.group.groupId === action.groupId) {
        newState2.chat = undefined;
      }
      return newState2;
    case 'updateReadCount':
      return Object.assign({}, state, {
        chat: Object.assign({}, state.chat, {
          messages: Object.assign({}, state.chat?.messages, {
            data: (state.chat?.messages?.data || []).map((msg) => {
              if (msg.id === action.readMessage.id && msg.unReadCount > 0) {
                return Object.assign({}, msg, {
                  unReadCount: msg.unReadCount - 1,
                });
              }
              return msg;
            }),
          }),
        }),
      });
    case 'messageSearchVisible':
      return Object.assign({}, state, {
        messageSearchVisible: action.visible,
      });
    case 'quitGroup':
      if (
        state.chat?.group &&
        state.chat.group.groupId === action.group.groupId
      ) {
        // 如果退出的是当前正在的群聊
        Object.assign(
          state,
          {},
          {
            chat: undefined,
          }
        );
      }
      return state;
    case 'dismissGroup':
      const newState1 = Object.assign({}, state, {
        groups: state.groups.filter(
          (group) => group.groupId !== action.groupId
        ),
      });
      if (state.chat && state.chat.group.groupId === action.groupId) {
        newState1.chat = undefined;
      }
      return newState1;
    case 'previewMedia':
      return Object.assign({}, state, {
        previewMedia: {
          mediaType: action.mediaType,
          url: action.url,
        },
      });
    case 'reset':
      return initialState;
    case 'clearUnreadNum':
      return Object.assign({}, state, {
        groups: (state.groups || []).map((item) => {
          if (item.groupId !== action.groupId) return item;
          return Object.assign({}, item, {
            unReadCount: 0,
          });
        }),
      });
    case 'changeShowType':
      return Object.assign({}, state, {
        showType: action.showType,
      });
    default:
      return state;
  }
}
