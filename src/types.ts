export interface ProviderModel {
  id: string;
  name: string;
  modelCode: string;
  baseUrl: string;
  apiKey: string;
}

export interface GlobalSettings {
  systemPrompt: string;
  defaultModelId: string;
  streamEnabled: boolean;
  contextRounds: number;
}

export interface QQBotConfig {
  appId: string;
  appSecret: string;
  token: string;
}

