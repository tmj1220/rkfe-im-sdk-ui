import React, { useContext, useRef, useState } from 'react';
import styles from './index.less';
import { TextInput, VoiceInput } from '../../src';
import ImCore from 'rkfe-im-sdk-core';
import { SContext, StoreContext } from '../index';
import { message, Spin } from 'antd';
import {
  AudioOutlined,
  FileImageOutlined,
  FolderOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { getAudioDuration } from '../utils';

export default function MessageInput() {
  const { state, dispatch }: StoreContext = useContext(SContext);

  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const [text, setText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 标已读，每次发消息的时候调一下；同时置空一下当前 group 的未读数
  const updateRecordTime = (groupId: string) => {
    ImCore.getSingleton().updateRecordTime(groupId);
    dispatch({
      type: 'clearUnreadNum',
      groupId,
    });
  };

  // 清空输入框
  const clearInput = () => {
    setText('');
  };

  // 发送文字消息
  const sendTextMessage = async () => {
    const groupId = state.chat.group.groupId;
    updateRecordTime(groupId);
    await ImCore.getSingleton().sendTextMessage(
      {
        receiveGroup: groupId,
      },
      text
    );
  };

  // 输入框回车回调
  const onTextInputSend = () => {
    sendTextMessage().then(clearInput);
  };

  // 发送按钮回调
  const onSendClick = () => {
    sendTextMessage().then(clearInput);
  };

  // 文件选中回调
  const onFileInputChange = (ref: HTMLInputElement) => {
    if (state.chat) {
      const files: FileList = ref.files as FileList;
      if (files && files.length) {
        const fileSendPromise = [];
        const groupId = state.chat.group.groupId;
        updateRecordTime(groupId);
        const to = { receiveGroup: groupId };
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const onProgress = (progress) => {
            console.log(`文件${i}进度:`, progress);
          };
          const fileType = file.type;
          // 区分文件类型，发送消息
          if (/image/.exec(fileType)) {
            // 图片文件
            fileSendPromise.push(
              ImCore.getSingleton().sendImageMessage(to, file, {
                onProgress,
              })
            );
          } else if (/video/.exec(fileType)) {
            // 视频文件
            fileSendPromise.push(
              ImCore.getSingleton().sendVideoMessage(to, file, { onProgress })
            );
          } else {
            // 其他都当做文件处理
            fileSendPromise.push(
              ImCore.getSingleton().sendFileMessage(to, file, { onProgress })
            );
          }
        }
        dispatch({ type: 'uploadingFile', uploading: true });
        Promise.all(fileSendPromise)
          .catch((error) => {
            console.log(error);
            message.error(error.message);
          })
          .finally(() => dispatch({ type: 'uploadingFile', uploading: false }));
      }
    }
  };

  // 语音录完回调
  const onVoiceRecord = (voice: File) => {
    dispatch({ type: 'uploadingFile', uploading: true });
    if (state.chat) {
      ImCore.getSingleton()
        .sendVoiceMessage({ receiveGroup: state.chat.group.groupId }, voice)
        .catch((error) => {
          console.log(error);
        })
        .finally(() => dispatch({ type: 'uploadingFile', uploading: false }));
    }
  };

  return (
    <Spin spinning={state.chat.fileUploading} tip="文件上传中">
      <div className={styles.inputArea}>
        <div className={styles.selectArea}>
          <label htmlFor="rk-im-example-file-select" className={styles.label}>
            <FolderOutlined className={styles.icon} />
          </label>
          <input
            ref={fileInputRef}
            id="rk-im-example-file-select"
            type="file"
            onChange={() => onFileInputChange(fileInputRef?.current)}
            multiple
          />
          {/*<label htmlFor="rk-im-example-emoji-select" className={styles.label}>
            <SmileOutlined className={styles.icon} />
          </label>*/}
          <label htmlFor="rk-im-example-image-select" className={styles.label}>
            <FileImageOutlined className={styles.icon} />
          </label>
          <input
            ref={imageInputRef}
            id="rk-im-example-image-select"
            type="file"
            accept="image/*"
            onChange={() => onFileInputChange(imageInputRef!.current)}
            multiple
          />
          {/*<label
            className={styles.label}
            onClick={() => setShowVoiceInput(!showVoiceInput)}
          >
            <AudioOutlined className={styles.icon} />
          </label>*/}
          <label
            className={styles.label}
            onClick={() =>
              dispatch({ type: 'messageSearchVisible', visible: true })
            }
          >
            <SearchOutlined className={styles.icon} />
          </label>
        </div>
        {showVoiceInput ? (
          <div className={styles.voiceInputContainer}>
            <VoiceInput onRecord={onVoiceRecord} />
          </div>
        ) : (
          <div className={styles.textInputContainer}>
            <TextInput
              placeholder="请输入消息"
              value={text}
              onChange={(value) => setText(value)}
              onSend={onTextInputSend}
            />
            <div className={styles.sendActionArea}>
              <span className={styles.sendActionTip}>
                Enter 发送/Ctrl+Enter 换行
              </span>
              <button onClick={onSendClick}>发送消息</button>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
}
