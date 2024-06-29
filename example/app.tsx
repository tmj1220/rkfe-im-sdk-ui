import React, { useContext, useEffect } from 'react';
import styles from './app.less';
import 'antd/dist/antd.css';

import MessageInput from './MessageInput';
import Chat from './Chat/Chat';
import TokenInput from './TokenInput/TokenInput';
import { SContext, StoreContext } from './index';
import MessageSearch from './MessageSearch/MessageSearch';
import MediaPreview from './MediaPreview/MediaPreview';
import ImCore from 'rkfe-im-sdk-core';
import { ShowType } from './store';
import GroupSearch from './GroupSearch/GroupSearch';
import Groups from './Groups/Groups';
import ShowTypeCom from './ShowType';
import Users from './Users';

export default function App() {
  const { state }: StoreContext = useContext(SContext);

  useEffect(() => {
    window.addEventListener('offline', () => {
      console.log('网络断开，断开连接');
      ImCore.getSingleton().disConnect();
    });

    window.addEventListener('online', () => {
      console.log('网络连上了，重新连接');
      ImCore.getSingleton().connect();
    });
  }, []);

  return (
    <div className={styles.container}>
      <ShowTypeCom />
      {state.userId &&
        (state.showType === ShowType.Session ? (
          <div className={styles.list}>
            <GroupSearch />
            <Groups />
          </div>
        ) : (
          <div className={styles.list}>
            <Users />
          </div>
        ))}
      {state.chat && (
        <div className={styles.chatContainer}>
          <Chat />
          <MessageInput />
        </div>
      )}
      {state.messageSearchVisible && <MessageSearch />}
      <TokenInput />
      {state.previewMedia?.url && <MediaPreview />}
    </div>
  );
}
