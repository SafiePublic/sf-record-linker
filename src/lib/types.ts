export interface ObjectSetting {
  enabled: boolean;
  fieldLabel: string;
  showLabel: boolean;
}

export interface ObjectSettings {
  [key: string]: ObjectSetting;
}
