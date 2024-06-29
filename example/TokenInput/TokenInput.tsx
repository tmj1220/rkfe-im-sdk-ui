import React, { useContext, useEffect, useState } from 'react';
import { SContext, StoreContext } from '../index';
import { Input, message, Modal } from 'antd';
import jwt_decode from 'jwt-decode';
import { useRequest } from 'ahooks';
import { SAAS, TOKEN_KEY, USER_ID_KEY } from '../config';

export default function TokenInput() {
  const [visible, setVisible] = useState(true);

  const [companyIndex, setCompanyIndex] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  const { state, action }: StoreContext = useContext(SContext);

  const { loading: loginLoading, run: login } = useRequest(
    () => {
      return fetch(`${SAAS}/api/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey: 'app',
          companyIndex: companyIndex,
          deviceUserName: account,
          password: password,
          grantType: 'companyUser',
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.code !== 1) {
            message.error('登录失败');
            return;
          }
          const token = result.data.accessToken;
          const decoded = jwt_decode(token);
          if (decoded['authInfo']) {
            const { companyUserId } = JSON.parse(decoded['authInfo']);

            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_ID_KEY, companyUserId);

            action.init(token, companyUserId).then(() => setVisible(false));
          }
        });
    },
    { manual: true }
  );

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);
    if (token && userId) {
      action.init(token, userId).then(() => setVisible(false));
    }
  }, []);

  const onOk = async () => {
    if (!companyIndex || !account || !password) {
      message.error('输入账号密码和公司代号ID');
      return;
    }
    login();
  };

  return (
    <Modal
      title="账号登录"
      visible={visible}
      cancelText="不能取消"
      okText="确认"
      onOk={onOk}
      confirmLoading={loginLoading || state.loading}
      closeIcon={null}
    >
      <Input
        value={companyIndex}
        onChange={(event) => setCompanyIndex(event.target.value)}
        placeholder="输入公司代号ID"
      />
      <Input
        value={account}
        onChange={(event) => setAccount(event.target.value)}
        style={{ marginTop: 20 }}
        placeholder="输入账号"
      />
      <Input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        style={{ marginTop: 20 }}
        placeholder="输入密码"
      />
    </Modal>
  );
}
