/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */
import { sendEvent } from './request';
import { PlausibleOptions } from './tracker';

const getXhrMockClass = () => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  onreadystatechange: jest.fn(),
  readyState: 0,
  ready(state: number) {
    this.readyState = state;
    this.onreadystatechange();
  },
});

let xhrMockClass: ReturnType<typeof getXhrMockClass>;

const xmr = jest.spyOn(window, 'XMLHttpRequest');

const defaultData: Required<PlausibleOptions> = {
  hashMode: false,
  trackLocalhost: false,
  url: 'https://my-app.com/my-url',
  domain: 'my-app.com',
  referrer: null,
  deviceWidth: 1080,
  apiHost: 'https://plausible.io',
};

const oldLocation = window.location;

const windowLocation = JSON.stringify(window.location);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete window['location'];
Object.defineProperty(window, 'location', {
  value: JSON.parse(windowLocation),
});

beforeEach(() => {
  jest.clearAllMocks();
  xhrMockClass = getXhrMockClass();
  xmr.mockReturnValue((xhrMockClass as unknown) as XMLHttpRequest);
  window.location.hostname = 'my-app.com';
  window.location.protocol = 'http:';
});

afterAll(() => {
  Object.defineProperty(window, 'location', oldLocation);
});

describe('sendEvent', () => {
  test('sends default event', () => {
    expect(xmr).not.toHaveBeenCalled();
    sendEvent('myEvent', defaultData);
    xhrMockClass.ready(4);
    expect(xmr).toHaveBeenCalledTimes(1);
    expect(xhrMockClass.open).toHaveBeenCalledWith(
      'POST',
      `${defaultData.apiHost}/api/event`,
      true
    );
    expect(xhrMockClass.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/plain'
    );

    const payload = {
      n: 'myEvent',
      u: defaultData.url,
      d: defaultData.domain,
      r: defaultData.referrer,
      w: defaultData.deviceWidth,
      h: 0,
    };

    expect(xhrMockClass.send).toHaveBeenCalledWith(JSON.stringify(payload));
  });
  test('hash mode', () => {
    expect(xmr).not.toHaveBeenCalled();
    sendEvent('myEvent', { ...defaultData, hashMode: true });

    const payload = {
      n: 'myEvent',
      u: defaultData.url,
      d: defaultData.domain,
      r: defaultData.referrer,
      w: defaultData.deviceWidth,
      h: 1,
    };

    expect(xhrMockClass.send).toHaveBeenCalledWith(JSON.stringify(payload));
  });
  test('does not send to localhost', () => {
    window.location.hostname = 'localhost';
    expect(xmr).not.toHaveBeenCalled();
    sendEvent('myEvent', defaultData);
    expect(xmr).not.toHaveBeenCalled();
  });
  test('does not send if local file', () => {
    window.location.protocol = 'file:';
    expect(xmr).not.toHaveBeenCalled();
    sendEvent('myEvent', defaultData);
    expect(xmr).not.toHaveBeenCalled();
  });
  test('sends to localhost if trackLocalhost', () => {
    window.location.hostname = 'localhost';
    expect(xmr).not.toHaveBeenCalled();
    sendEvent('myEvent', { ...defaultData, trackLocalhost: true });
    expect(xmr).toHaveBeenCalled();
  });
  test('calls callback', () => {
    expect(xmr).not.toHaveBeenCalled();
    const callback = jest.fn();
    sendEvent('myEvent', defaultData, { callback });
    expect(callback).not.toHaveBeenCalled();
    xhrMockClass.ready(3);
    expect(callback).not.toHaveBeenCalled();
    xhrMockClass.ready(4);
    expect(callback).toHaveBeenCalled();
  });
  test('sends props', () => {
    expect(xmr).not.toHaveBeenCalled();
    const props = { variation1: 'A', variation2: 'B' };
    sendEvent('myEvent', defaultData, { props });

    const payload = {
      n: 'myEvent',
      u: defaultData.url,
      d: defaultData.domain,
      r: defaultData.referrer,
      w: defaultData.deviceWidth,
      h: 0,
      p: JSON.stringify(props),
    };

    expect(xhrMockClass.send).toHaveBeenCalledWith(JSON.stringify(payload));
  });
});
