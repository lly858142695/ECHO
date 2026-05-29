import { basename, extname, normalize, sep } from 'node:path';
import {
  pluginApiVersion,
  pluginPermissions,
  type PluginCommandContribution,
  type PluginCoverProviderContribution,
  type PluginLyricsProviderContribution,
  type PluginManifest,
  type PluginManifestContributes,
  type PluginMetadataProviderContribution,
  type PluginPanelContribution,
  type PluginPermission,
  type PluginSettingContribution,
  type PluginSettingOption,
  type PluginSettingType,
  type PluginSourceProviderContribution,
} from '../../shared/types/plugins';

const pluginIdPattern = /^[a-z0-9][a-z0-9._-]{1,63}$/u;
const safeRelativePathPattern = /^[^<>:"|?*\u0000-\u001f]+$/u;
const permissionSet = new Set<PluginPermission>(pluginPermissions);
const settingTypes = new Set<PluginSettingType>(['string', 'select', 'boolean', 'number', 'secret']);

const asText = (value: unknown, field: string, maxLength = 120): string => {
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} must not be empty`);
  }

  return trimmed.slice(0, maxLength);
};

const normalizePluginId = (value: unknown): string => {
  const id = asText(value, 'id', 64).toLowerCase();
  if (!pluginIdPattern.test(id)) {
    throw new Error('id must use lowercase letters, numbers, dot, dash, or underscore');
  }
  return id;
};

const normalizeRelativeFilePath = (value: unknown, field: string, fallback: string | null): string | undefined => {
  if (value === undefined || value === null) {
    return fallback ?? undefined;
  }

  const input = asText(value, field, 180).replace(/\\/gu, '/');
  const normalized = normalize(input);

  if (
    normalized.startsWith('..') ||
    normalized.includes(`..${sep}`) ||
    normalized.includes('/') ||
    normalized.includes('\\') ||
    !safeRelativePathPattern.test(normalized)
  ) {
    throw new Error(`${field} must be a file name inside the plugin folder`);
  }

  return normalized;
};

const normalizePermissions = (value: unknown): PluginPermission[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: PluginPermission[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !permissionSet.has(item as PluginPermission)) {
      throw new Error(`unknown plugin permission:${String(item)}`);
    }
    if (!normalized.includes(item as PluginPermission)) {
      normalized.push(item as PluginPermission);
    }
  }
  return normalized;
};

const normalizeCommand = (value: unknown): PluginCommandContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginCommandContribution>;
  try {
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'command title', 80),
      description: typeof input.description === 'string' && input.description.trim() ? input.description.trim().slice(0, 180) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizePanel = (value: unknown): PluginPanelContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginPanelContribution>;
  try {
    const path = normalizeRelativeFilePath(input.path, 'panel path', null);
    if (!path || extname(path).toLowerCase() !== '.html') {
      return null;
    }
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'panel title', 80),
      path,
    };
  } catch {
    return null;
  }
};

const normalizeSettingDefaultValue = (type: PluginSettingType, value: unknown): PluginSettingContribution['defaultValue'] | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if ((type === 'string' || type === 'select' || type === 'secret') && typeof value === 'string') {
    return value.slice(0, 500);
  }
  if (type === 'boolean' && typeof value === 'boolean') {
    return value;
  }
  if (type === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return undefined;
};

const normalizeSettingOptions = (value: unknown): PluginSettingOption[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const options: PluginSettingOption[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const input = item as Partial<PluginSettingOption>;
    if (typeof input.label !== 'string' || typeof input.value !== 'string' || !input.label.trim() || !input.value.trim()) {
      continue;
    }
    const option = {
      label: input.label.trim().slice(0, 80),
      value: input.value.trim().slice(0, 160),
    };
    if (!options.some((existing) => existing.value === option.value)) {
      options.push(option);
    }
  }
  return options.length > 0 ? options.slice(0, 24) : undefined;
};

const normalizeOptionalNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const normalizeSetting = (item: unknown): PluginSettingContribution | null => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return null;
  }

  const setting = item as Partial<PluginSettingContribution>;
  try {
    const type = typeof setting.type === 'string' && settingTypes.has(setting.type as PluginSettingType)
      ? setting.type as PluginSettingType
      : 'string';
    const normalized: PluginSettingContribution = {
      id: normalizePluginId(setting.id),
      title: asText(setting.title, 'setting title', 80),
      type,
    };
    if (typeof setting.description === 'string' && setting.description.trim()) {
      normalized.description = setting.description.trim().slice(0, 180);
    }
    const defaultValue = normalizeSettingDefaultValue(type, setting.defaultValue);
    if (defaultValue !== undefined) {
      normalized.defaultValue = defaultValue;
    }
    if (type === 'select') {
      normalized.options = normalizeSettingOptions(setting.options);
      if (!normalized.options) {
        return null;
      }
    }
    if (typeof setting.placeholder === 'string' && setting.placeholder.trim()) {
      normalized.placeholder = setting.placeholder.trim().slice(0, 120);
    }
    if (type === 'number') {
      const min = normalizeOptionalNumber(setting.min);
      const max = normalizeOptionalNumber(setting.max);
      if (min !== undefined) {
        normalized.min = min;
      }
      if (max !== undefined) {
        normalized.max = max;
      }
    }
    if (typeof setting.required === 'boolean') {
      normalized.required = setting.required;
    }
    return normalized;
  } catch {
    return null;
  }
};

const normalizeMetadataProvider = (value: unknown): PluginMetadataProviderContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginMetadataProviderContribution>;
  try {
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'metadata provider title', 80),
      description: typeof input.description === 'string' && input.description.trim() ? input.description.trim().slice(0, 180) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizeSourceProvider = (value: unknown): PluginSourceProviderContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginSourceProviderContribution>;
  try {
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'source provider title', 80),
      description: typeof input.description === 'string' && input.description.trim() ? input.description.trim().slice(0, 180) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizeLyricsProvider = (value: unknown): PluginLyricsProviderContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginLyricsProviderContribution>;
  try {
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'lyrics provider title', 80),
      description: typeof input.description === 'string' && input.description.trim() ? input.description.trim().slice(0, 180) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizeCoverProvider = (value: unknown): PluginCoverProviderContribution | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const input = value as Partial<PluginCoverProviderContribution>;
  try {
    return {
      id: normalizePluginId(input.id),
      title: asText(input.title, 'cover provider title', 80),
      description: typeof input.description === 'string' && input.description.trim() ? input.description.trim().slice(0, 180) : undefined,
    };
  } catch {
    return null;
  }
};

const normalizeContributes = (value: unknown): PluginManifestContributes => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const input = value as Partial<PluginManifestContributes>;
  return {
    commands: Array.isArray(input.commands) ? input.commands.map(normalizeCommand).filter((item): item is PluginCommandContribution => Boolean(item)) : [],
    panels: Array.isArray(input.panels) ? input.panels.map(normalizePanel).filter((item): item is PluginPanelContribution => Boolean(item)) : [],
    metadataProviders: Array.isArray(input.metadataProviders)
      ? input.metadataProviders
          .map(normalizeMetadataProvider)
          .filter((item): item is PluginMetadataProviderContribution => Boolean(item))
      : [],
    sourceProviders: Array.isArray(input.sourceProviders)
      ? input.sourceProviders
          .map(normalizeSourceProvider)
          .filter((item): item is PluginSourceProviderContribution => Boolean(item))
      : [],
    lyricsProviders: Array.isArray(input.lyricsProviders)
      ? input.lyricsProviders
          .map(normalizeLyricsProvider)
          .filter((item): item is PluginLyricsProviderContribution => Boolean(item))
      : [],
    coverProviders: Array.isArray(input.coverProviders)
      ? input.coverProviders
          .map(normalizeCoverProvider)
          .filter((item): item is PluginCoverProviderContribution => Boolean(item))
      : [],
    settings: Array.isArray(input.settings)
      ? input.settings
          .map(normalizeSetting)
          .filter((item): item is PluginSettingContribution => Boolean(item))
      : [],
  };
};

export const normalizePluginManifest = (value: unknown, directoryName = ''): PluginManifest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('manifest must be an object');
  }

  const input = value as Partial<PluginManifest>;
  const id = normalizePluginId(input.id ?? basename(directoryName));
  const apiVersion = Number(input.apiVersion);
  if (!Number.isInteger(apiVersion) || apiVersion < 1 || apiVersion > pluginApiVersion) {
    throw new Error(`apiVersion must be between 1 and ${pluginApiVersion}`);
  }

  const entry = normalizeRelativeFilePath(input.entry, 'entry', 'plugin.js');
  const panel = normalizeRelativeFilePath(input.panel, 'panel', null);
  if (entry && extname(entry).toLowerCase() !== '.js') {
    throw new Error('entry must be a .js file');
  }
  if (panel && extname(panel).toLowerCase() !== '.html') {
    throw new Error('panel must be a .html file');
  }

  return {
    id,
    name: asText(input.name ?? id, 'name', 80),
    version: asText(input.version ?? '0.0.1', 'version', 40),
    apiVersion,
    ...(typeof input.minEchoVersion === 'string' && input.minEchoVersion.trim() ? { minEchoVersion: input.minEchoVersion.trim().slice(0, 40) } : {}),
    entry,
    panel,
    permissions: normalizePermissions(input.permissions),
    contributes: normalizeContributes(input.contributes),
  };
};
