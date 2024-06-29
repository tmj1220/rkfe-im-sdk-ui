// 消息类型
import { Group } from 'rkfe-im-sdk-core/types/im';

export enum MessageType {
  Text = '1',
  Image = '2',
  Video = '3',
  Voice = '4',
  File = '5',
  System = '100',
  // 消息已读回执
  Read = '200',
}

export enum GroupType {
  // 单聊
  Single = 1,
  // 群聊
  Group = 2,
}

export const MessageTypeName = {
  [MessageType.Text]: '文字消息',
  [MessageType.Image]: '图片消息',
  [MessageType.Video]: '视频消息',
  [MessageType.Voice]: '语音消息',
  [MessageType.File]: '文件消息',
  [MessageType.System]: '系统消息',
  [MessageType.Read]: '已读回执',
};

// 消息类型数组，方便判断 type 是否在枚举范围用
export const MessageTypeArray = Object.keys(MessageType).map(
  (key) => MessageType[key]
);

// 当消息类型是系统消息(100)的时候，有 actionType 对应不同的消息
export enum SystemMessageActionType {
  // 添加群
  AddGroup = 1,
  // 邀请入群
  InviteInGroup = 2,
  // 移出群：有人离开该群
  OutOfGroup = 3,
  // 解散群：群没了
  DismissGroup = 4,
  // 登出
  Logout = 5,
  // 修改群信息
  GroupInfoChanged = 6,
  // 退群
  QuitGroup = 7,
}

// 当系统消息为 修改群信息时 content 是一个 JSON 字符串，内容如下
export interface GroupInfoChangedContent extends Group {
  // 修改人
  userId: string;
}

// 文字消息详情
export type TextMessageDetail = {
  content: string;
};

// 图片消息详情
export type ImageMessageDetail = {
  imgUrl: string;
  thumbUrl: string;
  imgWidth: number;
  imgHeight: number;
};

// 视频消息详情
export type VideoMessageDetail = {
  videoUrl: string;
  // 视频封面缩略图
  thumbUrl: string;
  duration: number;
  // 视频封面宽度
  videoWidth: number;
  // 视频封面高度
  videoHeight: number;
};

// 语音消息详情
export type VoiceMessageDetail = {
  voiceUrl: string;
  duration: number;
};

// 文件消息详情
export type FileMessageDetail = {
  fileUrl: string;
  fileName: string;
  // 文件大小 单位 字节
  fileSize: number;
};

// 系统消息详情
export type SystemMessageDetail = {
  msgAction: SystemMessageActionType;
  content: string;
};

// 消息详情
export type MessageDetail =
  | TextMessageDetail
  | ImageMessageDetail
  | VideoMessageDetail
  | VoiceMessageDetail
  | FileMessageDetail
  | SystemMessageDetail;

// 消息的接受者：个人或者群，必选一个
export interface MessageReceiver {
  receiveGroup?: string;
  reciever?: string;
}

// 消息的基本结构，发消息需要指定的参数
export interface MessageInit extends MessageReceiver {
  /**
   * 接口拿到的是 JSON 字符串
   * 不同的消息类型对应的 messageDetail 不同
   * 参考：https://rokid.yuque.com/docs/share/9bcf2167-93da-47bd-b38d-61c4f966043b?#
   * */
  messageDetail: string;
  messageType: MessageType;
}

// 消息详情：后端接口返回
export interface Message extends MessageInit {
  id?: string;
  sender?: string;
  sendTimeLong?: number;
  unReadCount?: number;
}

// 已读回执消息结构
export interface ReadMessage {
  // 被读消息的 ID
  id: string;
  messageType: MessageType.Read;
  reciever: string;
  receiveGroup: string;
}
