import { env } from '../lib/config.js';

const DEFAULT_BASE_DOMAIN = 'app.loxo.co';
const LOXO_ENV_PREFIXES = ['LOXO', 'NEXT_PUBLIC_LOXO'];

let hasLoggedMissingConfig = false;

function readProcessEnv(key) {
  const value = process.env[key];
  return typeof value === 'string' ? value : undefined;
}

function resolveValue({ keys, fallback }) {
  for (const key of keys) {
    const value = readProcessEnv(key);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim();
  }

  return '';
}

function logMissingConfigOnce(name, keysTried) {
  if (hasLoggedMissingConfig) return;
  hasLoggedMissingConfig = true;

  const availableKeys = Object.keys(process.env || {}).filter((key) =>
    LOXO_ENV_PREFIXES.some((prefix) => key.toUpperCase().includes(prefix))
  );

  console.error(
    `❌ [LoxoClient] Missing ${name}. Checked keys: ${keysTried.join(
      ', '
    )}. Available LOXO env keys: ${availableKeys.length ? availableKeys.join(', ') : 'none'}`
  );
}

function getLoxoConfig() {
  const apiKey = resolveValue({
    keys: ['LOXO_API_KEY', 'NEXT_PUBLIC_LOXO_API_KEY'],
    fallback: env.LOXO_API_KEY,
  });
  const slug = resolveValue({
    keys: ['LOXO_SLUG', 'NEXT_PUBLIC_LOXO_SLUG'],
    fallback: env.LOXO_SLUG,
  });
  const domain =
    resolveValue({
      keys: ['LOXO_DOMAIN', 'NEXT_PUBLIC_LOXO_DOMAIN'],
      fallback: env.LOXO_DOMAIN,
    }) || DEFAULT_BASE_DOMAIN;

  if (!apiKey) {
    logMissingConfigOnce('LOXO_API_KEY', ['LOXO_API_KEY', 'NEXT_PUBLIC_LOXO_API_KEY']);
    throw new Error('Missing Loxo config: LOXO_API_KEY must be defined');
  }
  if (!slug) {
    logMissingConfigOnce('LOXO_SLUG', ['LOXO_SLUG', 'NEXT_PUBLIC_LOXO_SLUG']);
    throw new Error('Missing Loxo config: LOXO_SLUG must be defined');
  }

  return {
    apiKey,
    slug,
    domain,
  };
}

function buildUrl(path, params) {
  const { slug, domain } = getLoxoConfig();
  const baseURL = `https://${domain}/api/${slug}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, baseURL);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    });
  }

  return url;
}

async function request(method, path, { params, data } = {}) {
  const { apiKey } = getLoxoConfig();
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const text = await response.text();
  let json;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch (err) {
      throw new Error(`Failed to parse Loxo response JSON for ${url.pathname}: ${err.message}`);
    }
  }

  if (!response.ok) {
    const message =
      (json && (json.message || json.error || json.detail)) ||
      `Loxo API request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json;
}

export const loxoClient = {
  get(path, options) {
    return request('GET', path, options);
  },
  post(path, options) {
    return request('POST', path, options);
  },
  put(path, options) {
    return request('PUT', path, options);
  },
  delete(path, options) {
    return request('DELETE', path, options);
  },
};

export default loxoClient;

