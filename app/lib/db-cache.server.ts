import { env } from "cloudflare:workers";

export type RouteCachePolicy = {
  maxAge?: string;
  sMaxage?: string;
  staleWhileRevalidate?: string;
};

export type DbCachePolicy = {
  ttl: number;
  staleWhileRevalidate?: number;
};

type CachedQueryOptions<T> = {
  key: string;
  cachePolicy: DbCachePolicy;
  getFreshValue: () => Promise<T>;
};

const parseUnit = (value: string | undefined) => {
  const normalized = value?.toLowerCase().trim();
  if (!normalized) return undefined;

  if (/^\d+$/.test(normalized)) {
    return Number.parseInt(normalized, 10);
  }

  const match = /^(\d+)\s*(ms|s|m|h|d|w|mo|y|seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/.exec(
    normalized
  );
  if (!match) return undefined;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  if (Number.isNaN(amount)) return undefined;

  const unitToSeconds = {
    ms: 0.001,
    s: 1,
    second: 1,
    seconds: 1,
    m: 60,
    minute: 60,
    minutes: 60,
    h: 3600,
    hour: 3600,
    hours: 3600,
    d: 86400,
    day: 86400,
    days: 86400,
    w: 604800,
    week: 604800,
    weeks: 604800,
    mo: 2592000,
    month: 2592000,
    months: 2592000,
    y: 31536000,
    year: 31536000,
    years: 31536000,
  } as const;

  const seconds = unitToSeconds[unit as keyof typeof unitToSeconds];
  if (seconds === undefined) return undefined;
  return amount * seconds;
};

export const deriveDbCachePolicy = (policy: RouteCachePolicy): DbCachePolicy => {
  return {
    ttl:
      parseUnit(policy.sMaxage) ??
      parseUnit(policy.maxAge) ??
      0,
    staleWhileRevalidate: parseUnit(policy.staleWhileRevalidate),
  };
};

const jsonSafe = (value: unknown): unknown => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(jsonSafe);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = jsonSafe((value as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }

  return value;
};

export const normalizeCacheValue = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(jsonSafe(value))) as T;
};

const normalizeCacheKeyValue = (value: unknown): unknown => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value
      .map(normalizeCacheKeyValue)
      .sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b))
      );
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeCacheKeyValue(
          (value as Record<string, unknown>)[key]
        );
        return acc;
      }, {} as Record<string, unknown>);
  }

  return value;
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

type CacheEnvelope = {
  value: unknown;
  createdTime?: number;
  metadata?: Record<string, unknown>;
};

const isCacheEnvelope = (value: unknown): value is CacheEnvelope => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "value" in value &&
    "createdTime" in value
  );
};

export const createDbCacheKey = (scope: string, payload: unknown) => {
  const normalizedPayload = normalizeCacheKeyValue(payload);
  const stablePayload = JSON.stringify(normalizedPayload);
  return `${scope}:${hashString(stablePayload)}`;
};

type CachedResult<T> = {
  value: T;
  createdTime?: number;
};

type CacheValueWithMetadata = {
  value: unknown;
  createdTime?: number;
  metadata?: Record<string, unknown>;
};

type CacheLike = {
  get: (key: string) => Promise<unknown>;
  set: (
    key: string,
    value: unknown,
    options?: { ttl?: number; metadata?: Record<string, unknown> }
  ) => Promise<void>;
};

const resolveCachedValue = <T>(entry: unknown): CachedResult<T> | null => {
  if (entry === null || entry === undefined) {
    return null;
  }

  if (
    typeof entry === "object" &&
    !Array.isArray(entry) &&
    entry !== null &&
    "value" in entry
  ) {
    const typed = entry as CacheValueWithMetadata;
    if ("createdTime" in typed) {
      return {
        value: typed.value as T,
        createdTime: typed.createdTime,
      };
    }
  }

  return {
    value: entry as T,
  };
};

type CachifiedOptions<T> = {
  key: string;
  cache: CacheLike;
  ttl: number;
  staleWhileRevalidate?: number;
  getFreshValue: () => Promise<T>;
};

const fallbackCachified = async <T>({
  key,
  cache,
  ttl,
  staleWhileRevalidate,
  getFreshValue,
}: CachifiedOptions<T>): Promise<T> => {
  const now = Date.now();
  const secondsSince = (time: number) => (now - time) / 1000;
  const cached = resolveCachedValue<T>(await cache.get(key));

  if (cached) {
    if (cached.createdTime) {
      const age = secondsSince(cached.createdTime);
      if (age <= ttl) {
        return cached.value;
      }

      const canServeStale =
        typeof staleWhileRevalidate === "number" &&
        staleWhileRevalidate > 0 &&
        age <= ttl + staleWhileRevalidate;

      if (canServeStale) {
        void getFreshValue()
          .then(async (freshValue) => {
            await cache.set(key, freshValue, {
              ttl: Math.ceil(ttl),
            });
          })
          .catch((error) => {
            console.warn("db-cache:stale-refresh-failed", {
              key,
              error: String(error),
            });
          });

        return cached.value;
      }
    }
  }

  const freshValue = normalizeCacheValue(await getFreshValue());
  await cache.set(key, freshValue, { ttl: Math.ceil(ttl) });
  return freshValue;
};

const createKvCache = () => {
  const dbQueryCache = env.DB_QUERY_CACHE;
  if (!dbQueryCache) {
    return null;
  }

  return {
    get: async (key: string) => {
      const value = await dbQueryCache.get<unknown>(key, { type: "json" });
      return value === null ? undefined : value;
    },
    set: async (
      key: string,
      value: unknown,
      options: { ttl?: number; metadata?: Record<string, unknown> } = {}
    ) => {
      const normalizedValue = normalizeCacheValue(value);
      const payload = isCacheEnvelope(normalizedValue)
        ? normalizedValue
        : {
            value: normalizedValue,
            createdTime: Date.now(),
            metadata: options.metadata,
          };
      await dbQueryCache.put(key, JSON.stringify(payload), {
        expirationTtl: options.ttl ? Math.ceil(options.ttl) : undefined,
        metadata: options.metadata,
      });
    },
    delete: async (key: string) => {
      await dbQueryCache.delete(key);
    },
  };
};

export const getCachedQuery = async <T>({
  key,
  cachePolicy,
  getFreshValue,
}: CachedQueryOptions<T>): Promise<T> => {
  if (cachePolicy.ttl <= 0) {
    return normalizeCacheValue(await getFreshValue());
  }

  const cache = createKvCache();
  if (!cache) {
    return normalizeCacheValue(await getFreshValue());
  }

  try {
    return (await fallbackCachified({
      key,
      cache,
      ttl: cachePolicy.ttl,
      staleWhileRevalidate: cachePolicy.staleWhileRevalidate,
      getFreshValue: async () => normalizeCacheValue(await getFreshValue()),
    })) as T;
  } catch (error) {
    console.warn("db-cache:fallback", {
      key,
      error: String(error),
    });
    return normalizeCacheValue(await getFreshValue());
  }
};

export const withDbCache = getCachedQuery;
