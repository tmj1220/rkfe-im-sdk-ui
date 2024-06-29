import React, { useContext, useState } from 'react';
import styles from './index.less';
import { Button, Form, Input, Modal } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import UserSelect from '../UserSelect/UserSelect';
import { useRequest } from 'ahooks';
import ImCore from 'rkfe-im-sdk-core';
import { SContext, StoreContext } from '../index';
import { TOKEN_KEY, USER_ID_KEY } from '../config';
import { sleep } from '../utils';
// import { sleep } from '../utils';

export default function GroupSearch() {
  const { state, action }: StoreContext = useContext(SContext);

  const [addingGroup, setAddingGroup] = useState(false);

  const [form] = Form.useForm();

  const onOkClick = async () => {
    const values = await form.validateFields();
    const myId = state.userId;
    const userIdList = (values.userList || []).map((item) => item.userId);
    const params = Object.assign({}, values, {
      userIdList,
    });
    if (!userIdList.includes(myId)) {
      // 默认添加自己
      params.userIdList.push(myId);
    }
    // 自己作为群主
    params.ownerId = state.userId;
    const groupId = await ImCore.getSingleton().createGroup(params);
    // 解决新建群后，收到新建消息，但是 currentGroup 还是 undefined 的问题
    // 先收到新建群的消息(加载新群)，再重新刷一遍群列表，选中新建的群，把小红点去掉
    await sleep(1000);
    setAddingGroup(false);
    action.updateGroups({ groupId });
  };

  const { loading, run } = useRequest(onOkClick, {
    manual: true,
  });

  const onSearch = (value) => {
    action.updateGroups({ keywords: value });
  };

  return (
    <div className={styles.container}>
      <Input.Search
        placeholder="搜索群聊"
        allowClear
        onSearch={onSearch}
        style={{ flex: 1 }}
      />
      <PlusCircleOutlined
        className={styles.addIcon}
        onClick={() => setAddingGroup(true)}
      />
      <Button
        size="small"
        style={{ marginLeft: 16 }}
        danger
        onClick={() => {
          Modal.confirm({
            title: '提示',
            content: '确认退出吗',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_ID_KEY);
              window.location.reload();
            },
          });
        }}
      >
        退出
      </Button>
      <Modal
        title="新建群"
        visible={addingGroup}
        onOk={run}
        confirmLoading={loading}
        onCancel={() => setAddingGroup(false)}
        destroyOnClose
        okText="确认"
        cancelText="取消"
      >
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} form={form}>
          <Form.Item label="群名称" name="groupName">
            <Input placeholder="取一个群聊名称" />
          </Form.Item>
          <Form.Item label="群成员" name="userList">
            <UserSelect />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
