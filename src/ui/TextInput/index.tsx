import React, { useEffect, useState, KeyboardEvent } from 'react';
import styles from './index.less';
import { ComponentStyleProps } from '../../types/react';
import { getClassName } from '../../utils/component';

export interface MessageInputProps extends ComponentStyleProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  // 键盘 enter 键表示发送，ctrl + enter 是换行
  onSend?: (value: string) => void;
}

export default function Index(props: MessageInputProps) {
  const [value, setValue] = useState(props.defaultValue || '');

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const inputValueChange = (value?: string) => {
    const result = value || '';
    setValue(result);
    if (props.onChange) props.onChange(result);
  };

  const onInputKeydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        // 按住 ctrl 是换行操作
        inputValueChange(`${value}\n`);
      } else {
        // 阻止默认换行，改为发送操作
        event.preventDefault();
        if (value && props.onSend) {
          props.onSend(value);
        }
      }
    }
  };

  return (
    <textarea
      placeholder={props.placeholder}
      className={getClassName(styles.input, props.className)}
      style={props.style}
      value={value}
      onChange={(e) => inputValueChange(e.target.value)}
      onKeyDown={onInputKeydown}
    />
  );
}
