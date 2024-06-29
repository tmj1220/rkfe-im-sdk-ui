import React, { useContext } from 'react';
import styles from './index.less';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import { SContext, StoreContext } from '../index';
import { ShowType } from '../store';

export default function ShowTypeCom() {
  const { state, dispatch }: StoreContext = useContext(SContext);

  const changeShowType = (showType: ShowType) => {
    dispatch({
      type: 'changeShowType',
      showType,
    });
  };

  const selectedColor = '#1964fa';

  return (
    <div className={styles.container}>
      <MessageOutlined
        className={styles.icon}
        onClick={() => changeShowType(ShowType.Session)}
        style={
          state.showType === ShowType.Session ? { color: selectedColor } : {}
        }
      />
      <TeamOutlined
        className={styles.icon}
        onClick={() => changeShowType(ShowType.Users)}
        style={
          state.showType === ShowType.Users ? { color: selectedColor } : {}
        }
      />
    </div>
  );
}
