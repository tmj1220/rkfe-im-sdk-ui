import { User } from 'rkfe-im-sdk-core/types/im';
import React, { useContext, useState } from 'react';
import { Checkbox, Input } from 'antd';
import VirtualList from 'rc-virtual-list';
import { SContext, StoreContext } from '../index';

export interface UserSelectProps {
  filterUsers?: User[];
  value?: User[];
  onChange?: (value: User[]) => void;
  // 是否单选，默认 否
  single?: boolean;
  // 可选人员，默认是联系人列表所有人
  options?: User[];
}

export default function UserSelect(props: UserSelectProps) {
  const { state }: StoreContext = useContext(SContext);

  const { value = [], filterUsers = [] } = props;

  const [filter, setFilter] = useState('');

  // 收集选中的 ids
  const checkedIds = value.map((item) => item.userId);

  // 需要被过滤的 ids
  const filterIds = filterUsers.map((item) => item.userId);

  // 遍历确定是否选中
  const users = (props.options || state.contacts)
    .filter((item) => !filterIds.includes(item.userId))
    .map((user) => {
      // 拷贝一个对象，不要破坏原来的
      return Object.assign(
        {
          checked: checkedIds.includes(user.userId),
        },
        { ...user }
      );
    });

  const onChecked = (checked: boolean, user: User) => {
    if (props.onChange) {
      if (checked) {
        const addUser = state.contacts.find((item) => {
          return item.userId === user.userId;
        });
        if (addUser) props.onChange(value.concat([user]));
      } else {
        props.onChange(value.filter((item) => item.userId !== user.userId));
      }
    }
  };

  return (
    <div>
      <Input
        style={{ marginBottom: 10 }}
        placeholder="搜索"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <VirtualList
        // @ts-ignore
        data={users.filter((user) => new RegExp(filter).exec(user.realName))}
        height={200}
        itemHeight={22}
        itemKey="userId"
        style={{ padding: '10px 0', background: '#f8f9fb' }}
      >
        {(item: User) => {
          return (
            <Checkbox
              disabled={
                props.single &&
                !!value &&
                value.length > 0 &&
                item.userId !== value[0].userId
              }
              style={{ marginLeft: 8 }}
              key={item.username}
              // @ts-ignore
              checked={item.checked}
              onChange={(event) => onChecked(event.target.checked, item)}
            >
              {item.realName || '匿名用户'}
            </Checkbox>
          );
        }}
      </VirtualList>
    </div>
  );
}
