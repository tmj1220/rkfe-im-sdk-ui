import React, { CSSProperties } from 'react';
import { ComponentStyleProps } from '../../types/react';
import styles from './textMessage.less';
import { getClassName } from '../../utils/component';
import { addressFix, isNetAddress } from '../../utils/text';

interface TextMessageProps extends ComponentStyleProps {
  content: string;
  // 是否是自己的消息，默认非自己的
  self?: boolean;
  fontStyle?: CSSProperties;
  maxWidth?: string | number;
}
export default function TextMessage(props: TextMessageProps) {
  return (
    <div
      className={getClassName(styles.textMessageCon, props.className)}
      style={props.style}
    >
      <div
        className={styles.textMessage}
        style={Object.assign({}, props.fontStyle || {}, {
          backgroundColor: props.self ? '#d2e4fb' : '#fff',
          maxWidth: props.maxWidth || 200,
        })}
      >
        {isNetAddress(props.content) ? (
          <a href={addressFix(props.content)} target="_blank" rel="noreferrer">
            {props.content}
          </a>
        ) : (
          props.content
        )}
      </div>
    </div>
  );
}
