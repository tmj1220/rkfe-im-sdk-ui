import React, { useContext } from 'react';
import { SContext } from '../index';
import { MessageType } from '../../src/types/im';
import { Image, Modal } from 'antd';

export default function MediaPreview() {
  const { state, dispatch } = useContext(SContext);

  const close = () => {
    dispatch({
      type: 'previewMedia',
      url: null,
      mediaType: MessageType.Image,
    });
  };

  if (state.previewMedia?.mediaType === MessageType.Image) {
    return (
      <Image.PreviewGroup
        preview={{
          visible: !!state.previewMedia?.url,
          onVisibleChange: (vis) => {
            if (!vis) close();
          },
        }}
      >
        <Image src={state.previewMedia?.url} style={{ display: 'none' }} />
      </Image.PreviewGroup>
    );
  }
  if (state.previewMedia?.mediaType === MessageType.Video) {
    return (
      <Modal
        visible={!!state.previewMedia?.url}
        footer={null}
        onCancel={close}
        width={document.body.offsetWidth * 0.9}
        bodyStyle={{
          height: document.body.offsetHeight * 0.8,
        }}
      >
        <video
          src={state.previewMedia?.url}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls
        />
      </Modal>
    );
  }
  return null;
}
