import React, { useContext, useEffect, useRef, useState } from 'react';
import { MessageType } from '../../src/types/im';
import { SContext, StoreContext } from '../index';
import {
  DatePicker,
  Divider,
  Input,
  Modal,
  Pagination,
  Radio,
  Space,
  Spin,
} from 'antd';
import moment, { Moment } from 'moment';
import { useRequest } from 'ahooks';
import {
  FileMessageDetail,
  ImageMessageDetail,
  Message,
  VideoMessageDetail,
} from 'rkfe-im-sdk-core/types/im';
import ImCore from 'rkfe-im-sdk-core';
import { GroupMessageSearchParams } from 'rkfe-im-sdk-core/types/api';
import styles from '../Chat/index.less';
import { MessageItem } from '../../src';
import MessageList from './MessageList';

export default function MessageSearch() {
  const { state, dispatch }: StoreContext = useContext(SContext);
  // 条件
  const pageSizeRef = useRef(20);
  const [pageIndex, setPageIndex] = useState(0);
  const [messageDetail, setMessageDetail] = useState('');
  const [messageType, setMessageType] = useState<'0' | MessageType>('0'); // 0 表示综合
  const [sendTimeLongStart, setSendTimeLongStart] = useState(0);
  const [sendTimeLongEnd, setSendTimeLongEnd] = useState(0);

  const [hasNext, setHasNext] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  // 搜索
  const search = async (
    pageIndex: number,
    type?: '0' | MessageType
  ): Promise<Message[]> => {
    const params: GroupMessageSearchParams = {
      pageIndex,
      pageSize: pageSizeRef.current,
      receiveGroup: state.chat?.group.groupId,
    };
    const finalType = type || params.messageType;
    if (finalType !== '0') params.messageType = finalType;
    if (messageDetail) params.messageDetail = messageDetail;
    if (sendTimeLongStart) params.sendTimeLongStart = sendTimeLongStart;
    if (sendTimeLongEnd) params.sendTimeLongEnd = sendTimeLongEnd;
    const messages = await ImCore.getSingleton().historyMessageSearch(params);
    setPageIndex(pageIndex);
    return messages;
  };

  // 结果
  const { loading, run } = useRequest(
    async (pageIndex: number, type?: '0' | MessageType) => {
      const result = await search(pageIndex, type);
      if (result) {
        result.sort((a, b) => {
          const aT = a.sendTimeLong || 0;
          const bT = b.sendTimeLong || 0;
          return bT - aT;
        });

        setMessages(pageIndex === 1 ? result : messages.concat(result));
        setHasNext(result.length >= pageSizeRef.current);
        setPageIndex(pageIndex);
      }
    },
    {
      manual: true,
    }
  );

  const onSearch = () => {
    run(1, messageType);
  };

  // 默认加载综合
  useEffect(() => {
    run(1, '0');
  }, []);

  const onDateChange = (dates: Moment[]) => {
    if (!dates) {
      setSendTimeLongStart(undefined);
      setSendTimeLongEnd(undefined);
    }
    setSendTimeLongStart(dates[0] ? dates[0].valueOf() : undefined);
    setSendTimeLongEnd(dates[1] ? dates[1].valueOf() : undefined);
  };

  const onTypeChange = (type: MessageType | '0') => {
    setMessageType(type);
    run(1, type);
  };

  const previewMedia = (previewMessage: Message) => {
    // 大图链接
    let isImage =
      previewMessage && previewMessage.messageType === MessageType.Image;
    let imgUrl = '';
    if (isImage) {
      try {
        imgUrl = (
          JSON.parse(previewMessage.messageDetail) as ImageMessageDetail
        ).imgUrl;
      } catch (e) {
        console.log(e);
      }
      dispatch({
        type: 'previewMedia',
        mediaType: MessageType.Image,
        url: imgUrl,
      });
    }
    let isVideo =
      previewMessage && previewMessage.messageType === MessageType.Video;
    let videoUrl = '';
    if (isVideo) {
      try {
        videoUrl = (
          JSON.parse(previewMessage.messageDetail) as VideoMessageDetail
        ).videoUrl;
      } catch (e) {
        console.log(e);
      }
      dispatch({
        type: 'previewMedia',
        mediaType: MessageType.Video,
        url: videoUrl,
      });
    }
  };

  // 消息点击
  const onMessageClick = (message: Message) => {
    if (
      message.messageType === MessageType.Image ||
      message.messageType === MessageType.Video
    ) {
      previewMedia(message);
    } else if (message.messageType === MessageType.File) {
      try {
        const detail: FileMessageDetail = JSON.parse(message.messageDetail);
        window.open(detail.fileUrl);
      } catch (e) {}
    }
  };

  const onEndReached = () => {
    if (hasNext && !loading) {
      run(pageIndex + 1, messageType);
    }
  };

  return (
    <Modal
      title="搜索消息"
      visible={state.messageSearchVisible}
      footer={null}
      onCancel={() => {
        dispatch({ type: 'messageSearchVisible', visible: false });
      }}
      width={1000}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Space direction="vertical" size={12}>
          <Input.Search
            placeholder="消息关键词"
            onSearch={onSearch}
            style={{ width: 400 }}
            value={messageDetail}
            onChange={(e) => setMessageDetail(e.target.value)}
          />
          <DatePicker.RangePicker
            showTime
            placeholder={['开始时间', '结束时间']}
            style={{ width: 400 }}
            value={[
              sendTimeLongStart ? moment(sendTimeLongStart) : undefined,
              sendTimeLongEnd ? moment(sendTimeLongEnd) : undefined,
            ]}
            onChange={onDateChange}
            allowClear
          />
          <Radio.Group
            onChange={(event) => onTypeChange(event.target.value)}
            defaultValue="0"
            value={messageType}
          >
            <Radio.Button value={'0'}>综合</Radio.Button>
            <Radio.Button value={MessageType.Text}>文字</Radio.Button>
            <Radio.Button value={MessageType.Image}>图片</Radio.Button>
            <Radio.Button value={MessageType.Video}>视频</Radio.Button>
            <Radio.Button value={MessageType.File}>文件</Radio.Button>
          </Radio.Group>
        </Space>
        <Divider />
        <Space
          direction="vertical"
          size={12}
          style={{ width: '100%', backgroundColor: '#f8f9fb' }}
        >
          <MessageList
            className={styles.messageList}
            messages={messages || []}
            height={document.body.offsetHeight - 64 - 242}
            renderItem={(item, index) => {
              return (
                <div onClick={() => onMessageClick(item)}>
                  <MessageItem
                    message={item}
                    sender={state.contactMap[item.sender || '']}
                    self={state.userId === item.sender}
                    groupType={state.chat.group.groupType}
                  />
                </div>
              );
            }}
            itemHeight={84}
            itemKey="id"
            onEndReached={onEndReached}
            onEndReachedThreshold={50}
            listFooterComponent={
              <p
                style={{
                  width: '100%',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: 12,
                }}
              >
                {loading
                  ? '--- 加载中... ---'
                  : hasNext
                  ? '--- 加载更多 ---'
                  : '--- 没有更多了 ---'}
              </p>
            }
          />
          {/*<Pagination
            current={pageIndex}
            total={
              data?.length === pageSizeRef.current
                ? pageIndex * pageSizeRef.current + 1
                : pageIndex * pageSizeRef.current
            }
            onChange={(pageIndex) => {
              run(pageIndex);
            }}
          />*/}
        </Space>
      </Spin>
    </Modal>
  );
}
