// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import WebhookEventType from "./WebhookEventType.js";

type WebhooksSettings = {
  url: string;

  secret: string;

  events: WebhookEventType[];

  urlTesting?: string;
};

export const WebhooksSettingsFromJson = (obj: any): WebhooksSettings => {
  return {
    url: obj["webhooks_settings_url"],
    secret: obj["webhooks_settings_secret"],
    events: obj["webhooks_settings_events"].map((e) => WebhookEventType[e]),
    urlTesting: obj["webhooks_settings_url_testing"],
  } as WebhooksSettings;
};

export const FRAGMENT = `
fragment WebhooksSettingsFragment on WebhooksSettings {
    __typename
    webhooks_settings_url: url
    webhooks_settings_secret: secret
    webhooks_settings_events: events
    webhooks_settings_url_testing: url_testing
}`;

export default WebhooksSettings;
