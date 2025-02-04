import React from 'react';
import find from 'lodash/find';
import classnames from 'classnames';
import { safeStringifyJSON } from 'utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { updateResponsePaneTab } from 'providers/ReduxStore/slices/tabs';
import QueryResult from './QueryResult';
import Overlay from './Overlay';
import Placeholder from './Placeholder';
import ResponseHeaders from './ResponseHeaders';
import StatusCode from './StatusCode';
import ResponseTime from './ResponseTime';
import ResponseSize from './ResponseSize';
import Timeline from './Timeline';
import TestResults from './TestResults';
import TestResultsLabel from './TestResultsLabel';
import StyledWrapper from './StyledWrapper';

const ResponsePane = ({ rightPaneWidth, item, collection }) => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const isLoading = ['queued', 'sending'].includes(item.requestState);

  const selectTab = (tab) => {
    dispatch(
      updateResponsePaneTab({
        uid: item.uid,
        responsePaneTab: tab
      })
    );
  };

  const response = item.response || {};

  const getTabPanel = (tab) => {
    switch (tab) {
      case 'response': {
        return (
          <QueryResult
            item={item}
            collection={collection}
            width={rightPaneWidth}
            value={
              response.data ? (isJson(response.headers) ? safeStringifyJSON(response.data, true) : response.data) : ''
            }
            mode={getContentType(response.headers)}
          />
        );
      }
      case 'headers': {
        return <ResponseHeaders headers={response.headers} />;
      }
      case 'timeline': {
        return <Timeline request={item.requestSent} response={item.response} />;
      }
      case 'tests': {
        return <TestResults results={item.testResults} assertionResults={item.assertionResults} />;
      }

      default: {
        return <div>404 | Not found</div>;
      }
    }
  };

  if (isLoading) {
    return (
      <StyledWrapper className="flex h-full relative">
        <Overlay item={item} collection={collection} />
      </StyledWrapper>
    );
  }

  if (response.state !== 'success') {
    return (
      <StyledWrapper className="flex h-full relative">
        <Placeholder />
      </StyledWrapper>
    );
  }

  if (!activeTabUid) {
    return <div>Something went wrong</div>;
  }

  const focusedTab = find(tabs, (t) => t.uid === activeTabUid);
  if (!focusedTab || !focusedTab.uid || !focusedTab.responsePaneTab) {
    return <div className="pb-4 px-4">An error occurred!</div>;
  }

  const getTabClassname = (tabName) => {
    return classnames(`tab select-none ${tabName}`, {
      active: tabName === focusedTab.responsePaneTab
    });
  };

  const getContentType = (headers) => {
    if (headers && headers.length) {
      let contentType = headers
        .filter((header) => header[0].toLowerCase() === 'content-type')
        .map((header) => {
          return header[1];
        });
      if (contentType && contentType.length) {
        if (typeof contentType[0] == 'string' && /^[\w\-]+\/([\w\-]+\+)?json/.test(contentType[0])) {
          return 'application/ld+json';
        } else if (typeof contentType[0] == 'string' && /^[\w\-]+\/([\w\-]+\+)?xml/.test(contentType[0])) {
          return 'application/xml';
        }
      }
    }
    return '';
  };

  const isJson = (headers) => {
    return getContentType(headers) === 'application/ld+json';
  };

  return (
    <StyledWrapper className="flex flex-col h-full relative">
      <div className="flex items-center px-3 tabs" role="tablist">
        <div className={getTabClassname('response')} role="tab" onClick={() => selectTab('response')}>
          Response
        </div>
        <div className={getTabClassname('headers')} role="tab" onClick={() => selectTab('headers')}>
          Headers
        </div>
        <div className={getTabClassname('timeline')} role="tab" onClick={() => selectTab('timeline')}>
          Timeline
        </div>
        <div className={getTabClassname('tests')} role="tab" onClick={() => selectTab('tests')}>
          <TestResultsLabel results={item.testResults} assertionResults={item.assertionResults} />
        </div>
        {!isLoading ? (
          <div className="flex flex-grow justify-end items-center">
            <StatusCode status={response.status} />
            <ResponseTime duration={response.duration} />
            <ResponseSize size={response.size} />
          </div>
        ) : null}
      </div>
      <section className="flex flex-grow mt-5">{getTabPanel(focusedTab.responsePaneTab)}</section>
    </StyledWrapper>
  );
};

export default ResponsePane;
