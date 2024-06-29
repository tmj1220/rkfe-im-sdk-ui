import React, {
  Fragment,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import { SContext, StoreContext } from '../index';
import styles from './index.less';
import { Button, Divider, Form, Input, Modal } from 'antd';
import {
  EditOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import ImCore from 'rkfe-im-sdk-core';
import { User } from 'rkfe-im-sdk-core/types/im';
import { MessageType } from '../../src/types/im';
import { Content } from 'antd/es/layout/layout';
import UserSelect from '../UserSelect/UserSelect';

export default function GroupDetail() {
  const { state, action }: StoreContext = useContext(SContext);

  const avatarInputRef = useRef<HTMLInputElement>();

  const group = state.chat?.group;

  // 是否显示修改输入框
  const [editingName, setEditingName] = useState(false);
  // 修改值
  const [editingValue, setEditValue] = useState('');

  // 是否显示修改公告
  const [editingConfig, setEditingConfig] = useState(false);
  // 修改公告
  const [configEditingValue, setConfigEditingValue] = useState('');

  // 移出群聊二次确认
  const [deletingUser, setDeletingUser] = useState<User>();

  // 添加用户 Modal
  const [addingUser, setAddingUser] = useState(false);

  // 转让群主 Modal
  const [changingOwner, setChangingOwner] = useState(false);

  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  // 更新群名字
  const { loading, run } = useRequest(
    async () => {
      await ImCore.getSingleton().updateGroup({
        groupId: group.groupId,
        groupName: editingValue,
      });
      setEditingName(false);
      action.updateGroup(
        Object.assign({}, group, {
          groupName: editingValue,
        })
      );
    },
    { manual: true }
  );

  // 更新群公告
  const { loading: updatingGroupConfig, run: updateGroupConfig } = useRequest(
    async () => {
      await ImCore.getSingleton().updateGroup({
        groupId: group.groupId,
        groupConfig: configEditingValue,
      });
      setEditingConfig(false);
      action.updateGroup(
        Object.assign({}, group, {
          groupConfig: configEditingValue,
        })
      );
    },
    {
      manual: true,
    }
  );

  const onDeleteUserClick = (user: User) => {
    setDeletingUser(user);
  };

  // 确认踢出群
  const { loading: deleting, run: confirmDeleteUser } = useRequest(
    async () => {
      await ImCore.getSingleton().removeGroupUser({
        groupId: group.groupId,
        userIdList: [deletingUser.userId],
      });
      setDeletingUser(undefined);
      action.updateGroupUsers(
        group,
        group.userList.filter((item) => item.userId !== deletingUser.userId)
      );
    },
    { manual: true }
  );

  // 添加群成员
  const { loading: adding, run: addGroupUser } = useRequest(
    async () => {
      const values = await form.validateFields();
      const newUsers = values?.userList || [];
      const userIdList = newUsers.map((item) => item.userId);
      await ImCore.getSingleton().addGroupUser({
        groupId: group.groupId,
        userIdList,
      });
      setAddingUser(undefined);
      action.updateGroupUsers(group, group.userList.concat(newUsers));
    },
    { manual: true }
  );

  // 转让群主
  const { loading: changing, run: changeOwner } = useRequest(
    async () => {
      const values = await form2.validateFields();
      if (values.userList?.length) {
        const ownerId = values.userList[0].userId;
        await ImCore.getSingleton().updateGroup({
          groupId: group.groupId,
          ownerId,
        });
        action.updateGroup(
          Object.assign({}, group, {
            ownerId,
          })
        );
      }
      setChangingOwner(false);
    },
    { manual: true }
  );

  // 群头像输入框选中图片
  const onAvatarInputChange = async () => {
    const files = avatarInputRef.current?.files as FileList;
    if (files && files.length) {
      const image = files[0];
      // 先上传图片
      const { fileUrl } = await ImCore.getSingleton().uploadMedia({
        file: files[0],
        messageType: MessageType.Image,
      });
      // 修改头像
      await ImCore.getSingleton().updateGroup({
        groupId: group.groupId,
        groupAvatars: fileUrl,
      });
      action.updateGroup(
        Object.assign({}, group, {
          groupAvatars: fileUrl,
        })
      );
    }
  };

  if (!group) {
    return null;
  }

  // 渲染一个群成员
  const renderGroupUser = (user: User): ReactNode => {
    return (
      <div
        key={user.userId}
        className={styles.item}
        onClick={async () => {
          const info = await ImCore.getSingleton().getUserInfo(user.userId);
          Modal.info({
            title: '用户信息',
            content: JSON.stringify(info),
            okText: '确认',
            cancelText: '取消',
          });
        }}
      >
        <img className={styles.avatar} src={user.headPortrait} alt="头像" />
        <span className={styles.name}>{user.realName}</span>
        {state.userId === state.chat.group.ownerId &&
          state.userId !== user.userId && (
            <CloseCircleOutlined
              className={styles.deleteIcon}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteUserClick(user);
              }}
            />
          )}
      </div>
    );
  };

  // 渲染群成员列表
  const renderUsers = (): ReactNode[] => {
    const users = group.userList;
    const userElements: ReactNode[] = [];
    if (users && users.length) {
      // 先把群主挑出来
      const owner = users.find((user) => user.userId === group.ownerId);
      if (owner) userElements.push(renderGroupUser(owner));
      // 再渲染其他群成员
      {
        group.userList.map((user) => {
          if (user.userId !== group.ownerId) {
            userElements.push(renderGroupUser(user));
          }
        });
      }
    }
    return userElements;
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <label htmlFor="avatarInput">
          <a title="点击修改群头像">
            <img
              className={styles.avatar}
              src={group.groupAvatars}
              alt="群头像"
            />
          </a>
        </label>
        <input
          ref={avatarInputRef}
          type="file"
          style={{ display: 'none' }}
          id="avatarInput"
          accept="image/*"
          onChange={onAvatarInputChange}
        />
        {editingName ? (
          <Fragment>
            <Input
              value={editingValue}
              onChange={(event) => setEditValue(event.target.value)}
              style={{ marginLeft: 16 }}
            />
            <Button
              type="primary"
              size="small"
              onClick={run}
              loading={loading}
              style={{ marginLeft: 16 }}
            >
              确认
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <span className={styles.name}>{group.groupName}</span>
            <EditOutlined
              className={styles.editIcon}
              onClick={() => {
                setEditingName(true);
                setEditValue(group.groupName);
              }}
            />
          </Fragment>
        )}
      </div>
      <Divider />
      <div className={styles.configArea}>
        <div className={styles.header}>
          <span className={styles.title}>群公告</span>
          {editingConfig ? (
            <Button
              type="primary"
              size="small"
              onClick={updateGroupConfig}
              loading={updatingGroupConfig}
            >
              确认
            </Button>
          ) : (
            <EditOutlined
              className={styles.editConfigIcon}
              onClick={() => {
                setEditingConfig(true);
                setConfigEditingValue(group.groupConfig);
              }}
            />
          )}
        </div>
        {editingConfig ? (
          <Input.TextArea
            className={styles.content}
            value={configEditingValue}
            onChange={(event) => setConfigEditingValue(event.target.value)}
          />
        ) : (
          <span className={styles.content}>
            {group.groupConfig || '--暂无公告--'}
          </span>
        )}
      </div>
      <Divider />
      <div className={styles.userArea}>
        <div className={styles.head}>
          <span className={styles.title}>群成员 {group.userList.length}人</span>
          <PlusCircleOutlined
            className={styles.addUserIcon}
            onClick={() => setAddingUser(true)}
          />
        </div>
        <div className={styles.useList}>{renderUsers()}</div>
      </div>
      <Divider />
      <div className={styles.btnArea}>
        {state.userId === state.chat?.group.ownerId ? (
          <Fragment>
            <Button block onClick={() => setChangingOwner(true)}>
              转让群主
            </Button>
            <Button
              style={{ marginTop: 20 }}
              danger
              block
              onClick={() =>
                Modal.confirm({
                  title: '温馨提示',
                  content: '确定要解散该群吗？',
                  onOk: () => action.dismissGroup(state.chat.group),
                  okText: '确认',
                  cancelText: '取消',
                })
              }
            >
              解散群聊
            </Button>
          </Fragment>
        ) : (
          <Button
            block
            onClick={() =>
              Modal.confirm({
                title: '温馨提示',
                content: '确认要退出群聊吗？',
                onOk: () => action.quitGroup(state.chat.group),
                okText: '确认',
                cancelText: '取消',
              })
            }
          >
            退出群聊
          </Button>
        )}
      </div>
      <Modal
        title={'删除提醒'}
        visible={!!deletingUser}
        okText="确认"
        cancelText="取消"
        confirmLoading={deleting}
        onOk={confirmDeleteUser}
        onCancel={() => setDeletingUser(undefined)}
      >
        <Content>确认把 {deletingUser?.realName} 移出群聊吗？</Content>
      </Modal>
      <Modal
        title="添加群成员"
        visible={addingUser}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        confirmLoading={adding}
        onCancel={() => setAddingUser(undefined)}
        onOk={addGroupUser}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          form={form}
          initialValues={{
            userIdList: group.userList.map((item) => item.userId),
          }}
        >
          <Form.Item label="群成员" name="userList">
            <UserSelect filterUsers={group.userList} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="转让群主"
        visible={changingOwner}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        confirmLoading={changing}
        onCancel={() => setChangingOwner(false)}
        onOk={changeOwner}
      >
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} form={form2}>
          <Form.Item label="群成员" name="userList">
            <UserSelect
              single
              filterUsers={[state.contactMap[state.userId]]}
              options={group.userList}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
