import React from 'react';
import {
  FileMessageDetail,
  ImageMessageDetail,
  Message,
  MessageDetail,
  MessageType,
  MessageTypeArray,
  SystemMessageDetail,
  TextMessageDetail,
  VideoMessageDetail,
  VoiceMessageDetail,
} from '../../types/im';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import VideoMessage from './VideoMessage';
import FileMessage from './FileMessage';
import VoiceMessage from './VoiceMessage';
import { SystemMessage } from './SystemMessage';

export default function createMessageElement(message: Message, self?: boolean) {
  const { messageType, messageDetail } = message;
  let detail: MessageDetail;
  if (!MessageTypeArray.includes(messageType)) {
    return null;
  }
  try {
    detail = JSON.parse(messageDetail);
  } catch (e) {
    return null;
  }
  switch (messageType) {
    case MessageType.Text:
      return <TextMessage {...(detail as TextMessageDetail)} self={self} />;
    case MessageType.Image:
      return <ImageMessage {...(detail as ImageMessageDetail)} />;
    case MessageType.Video:
      return <VideoMessage {...(detail as VideoMessageDetail)} />;
    case MessageType.File:
      return <FileMessage {...(detail as FileMessageDetail)} self={self} />;
    case MessageType.System:
      return <SystemMessage {...(detail as SystemMessageDetail)} />;
    case MessageType.Voice:
      return <VoiceMessage {...(detail as VoiceMessageDetail)} self={self} />;
    default:
      return null;
  }
}
