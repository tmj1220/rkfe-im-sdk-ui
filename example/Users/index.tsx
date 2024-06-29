import React, { useContext, useState } from 'react';
import styles from './index.less';
import { Avatar, Input, List } from 'antd';
import { SContext, StoreContext } from '../index';
import { User } from 'rkfe-im-sdk-core/types/im';
import VirtualList from 'rc-virtual-list';
import ImCore from 'rkfe-im-sdk-core';
import { ShowType } from '../store';

export default function Users() {
  const { state, action, dispatch }: StoreContext = useContext(SContext);

  const [keywords, setKeywords] = useState('');

  const onSearch = (value) => setKeywords(value);

  const onUserClick = async (user: User) => {
    // 创建私聊
    const { groupId } = await ImCore.getSingleton().createSingleChatGroup({
      userIdList: [state.userId, user.userId],
    });
    // 刷新群会话列表，并选中该列表
    action.updateGroups({ groupId });
    // 切换到群会话
    dispatch({ type: 'changeShowType', showType: ShowType.Session });
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchCon}>
        <Input.Search
          value={keywords}
          placeholder="搜索用户"
          allowClear
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <VirtualList
        data={
          keywords
            ? state.contacts.filter(
                (item) => item.realName.indexOf(keywords) > -1
              )
            : state.contacts
        }
        // 60 是搜索区域高度
        height={document.body.clientHeight - 60}
        itemHeight={73}
        itemKey="userId"
      >
        {(item: User) => {
          return (
            <List.Item
              key={item.userId}
              className={styles.item}
              onClick={() => onUserClick(item)}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.headPortrait} />}
                title={<p className={styles.text}>{item.realName}</p>}
                description={
                  <p className={styles.text}>{item.unitName || '--'}</p>
                }
              />
            </List.Item>
          );
        }}
      </VirtualList>
    </div>
  );
}
