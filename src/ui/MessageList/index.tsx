import React, { Fragment, ReactNode, useLayoutEffect, useRef } from 'react';
import { ComponentStyleProps } from '../../types/react';
import { Message } from '../../types/im';
import VirtualList from 'rc-virtual-list';
import { ListRef } from 'rc-virtual-list/lib/List';

export interface MessageListProps extends ComponentStyleProps {
  messages: Message[];
  renderItem: (item: Message, index: number) => ReactNode;
  height: number;
  itemHeight: number;
  itemKey: string;
  onScroll?: (events: UIEvent) => void;
  onTopReached?: () => void;
  onTopReachedThreshold?: number;
  listHeaderComponent?: ReactNode;
}

export interface MessageListMethod {
  scrollToEnd: () => void;
}

export default function Index(props: MessageListProps) {
  const listRef = useRef<ListRef>(null);

  // 是否在消息底部
  const stickBottomRef = useRef<boolean>(true);

  const { onTopReachedThreshold = 0 } = props;

  const scrollToEnd = () => {
    // 不知道 scrollToTop 用一个很大的数代替
    listRef.current.scrollTo(999999999);
  };

  useLayoutEffect(() => {
    // 如果在底部，往下滚
    if (stickBottomRef.current) {
      scrollToEnd();
    }
  }, [props.messages.length]);

  const onScroll = (e) => {
    if (props.onScroll) {
      props.onScroll(e);
    }
    if (e.target.scrollTop < onTopReachedThreshold) {
      if (props.onTopReached) {
        props.onTopReached();
      }
    }
    if (e.target.scrollHeight - e.target.scrollTop < props.height + 50) {
      stickBottomRef.current = true;
    } else {
      stickBottomRef.current = false;
    }
  };

  return (
    <VirtualList
      data={props.messages}
      height={props.height}
      itemHeight={props.itemHeight}
      itemKey={props.itemKey}
      onScroll={onScroll}
      className={props.className}
      style={props.style}
      ref={listRef}
    >
      {(item: Message, index) => {
        if (index === 0) {
          return (
            <Fragment>
              {props.listHeaderComponent || null}
              <div key={item[props.itemKey]}>
                {props.renderItem(item, index)}
              </div>
            </Fragment>
          );
        }
        return (
          <div key={item[props.itemKey]}>{props.renderItem(item, index)}</div>
        );
      }}
    </VirtualList>
  );
}
