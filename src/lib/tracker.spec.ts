/* eslint-disable functional/immutable-data */
import * as requestModule from './request';
import Plausible, { PlausibleOptions } from './tracker';

const requestSpy = jest.spyOn(requestModule, 'sendEvent');

beforeEach(() => {
  jest.clearAllMocks();
  requestSpy.mockImplementation();
});

describe('tracker', () => {
  const getDefaultData: () => Required<PlausibleOptions> = () => ({
    hashMode: false,
    trackLocalhost: false,
    url: location.href,
    domain: location.hostname,
    referrer: document.referrer || null,
    deviceWidth: window.innerWidth,
    apiHost: 'https://plausible.io',
  });

  const getCustomData: () => Required<PlausibleOptions> = () => ({
    hashMode: true,
    trackLocalhost: true,
    url: 'https://my-url.com',
    domain: 'my-domain.com',
    referrer: 'my-referrer',
    deviceWidth: 1080,
    apiHost: 'https://my-api-hos.t',
  });

  const getEventOptions: () => Required<requestModule.EventOptions> = () => ({
    callback: jest.fn(),
    props: {
      variation1: 'A',
      variation2: 'B',
    },
  });

  test('inits with default config', () => {
    const { trackEvent } = Plausible();
    expect(requestSpy).not.toHaveBeenCalled();
    trackEvent('myEvent');
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith(
      'myEvent',
      expect.objectContaining<PlausibleOptions>(getDefaultData()),
      undefined
    );
  });
  test('inits with overridden config', () => {
    const config: PlausibleOptions = getCustomData();
    const { trackEvent } = Plausible(config);
    expect(requestSpy).not.toHaveBeenCalled();
    trackEvent('myEvent');
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith('myEvent', config, undefined);
  });
  describe('trackEvent', () => {
    test('tracks event', () => {
      const { trackEvent } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      trackEvent('myEvent');
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(
        'myEvent',
        getDefaultData(),
        undefined
      );
    });
    test('accepts data on trackEvent', () => {
      const { trackEvent } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const config: PlausibleOptions = getCustomData();
      trackEvent('myEvent', undefined, config);
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith('myEvent', config, undefined);
    });
    test('accepts options on trackEvent', () => {
      const { trackEvent } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const options: requestModule.EventOptions = getEventOptions();
      trackEvent('myEvent', options);
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(
        'myEvent',
        getDefaultData(),
        options
      );
    });
  });
  describe('pageView', () => {
    test('tracks pageview', () => {
      const { trackPageview } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      trackPageview();
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(
        'pageview',
        getDefaultData(),
        undefined
      );
    });
    test('accepts data on pageview', () => {
      const { trackPageview } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const config: PlausibleOptions = getCustomData();
      trackPageview(config);
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith('pageview', config, undefined);
    });
    test('accepts event options on pageview', () => {
      const { trackPageview } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const options: requestModule.EventOptions = getEventOptions();
      trackPageview({}, options);
      expect(requestSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledWith(
        'pageview',
        getDefaultData(),
        options
      );
    });
  });
  describe('enableAutoPageviews', () => {
    test('tracks first pageview', () => {
      const { enableAutoPageviews } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledWith(
        'pageview',
        getDefaultData(),
        undefined
      );
      cleanup();
    });
    test('does not track popstate if no history.pushState', () => {
      const originalPushState = history.pushState;
      const { enableAutoPageviews } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      history.pushState = (null as unknown) as History['pushState'];
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      window.dispatchEvent(new PopStateEvent('popstate'));
      expect(requestSpy).toHaveBeenCalledTimes(1);
      cleanup();
      history.pushState = originalPushState;
    });
    test('tracks pageviews on push state', () => {
      const { enableAutoPageviews } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      history.pushState({}, 'second', '/url');
      expect(requestSpy).toHaveBeenCalledTimes(2);
      cleanup();
    });
    test('tracks pageviews on popstate', () => {
      const { enableAutoPageviews } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      window.dispatchEvent(new PopStateEvent('popstate'));
      expect(requestSpy).toHaveBeenCalledTimes(2);
      cleanup();
    });
    test('does not track hashchange by default', () => {
      const { enableAutoPageviews } = Plausible();
      expect(requestSpy).not.toHaveBeenCalled();
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(requestSpy).toHaveBeenCalledTimes(1);
      cleanup();
    });
    test('tracks hashchange if specified', () => {
      const { enableAutoPageviews } = Plausible({ hashMode: true });
      expect(requestSpy).not.toHaveBeenCalled();
      const cleanup = enableAutoPageviews();
      expect(requestSpy).toHaveBeenCalledTimes(1);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(requestSpy).toHaveBeenCalledTimes(2);
      cleanup();
    });
  });
});
