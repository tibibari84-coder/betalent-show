function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

function encodedKeyFromSegments(key: string) {
  return key.split('/').map(encodeURIComponent).join('/');
}

function decodePathSegments(pathname: string) {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join('/');
}

export function buildR2AssetUrlFromConfig(input: {
  key: string;
  publicBaseUrl?: string | null;
  accountId?: string | null;
  bucketName?: string | null;
}) {
  const encodedKey = encodedKeyFromSegments(input.key);
  const publicBaseUrl = input.publicBaseUrl ? normalizeBase(input.publicBaseUrl) : null;

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${encodedKey}`;
  }

  return `https://${input.accountId}.r2.cloudflarestorage.com/${input.bucketName}/${encodedKey}`;
}

export function getR2KeyFromAssetUrlWithConfig(input: {
  assetUrl: string;
  publicBaseUrl?: string | null;
  accountId?: string | null;
  bucketName?: string | null;
}): string | null {
  try {
    const url = new URL(input.assetUrl);
    const publicBaseUrl = input.publicBaseUrl ? new URL(normalizeBase(input.publicBaseUrl)) : null;

    if (publicBaseUrl && url.origin === publicBaseUrl.origin) {
      const publicBasePath = normalizeBase(publicBaseUrl.pathname);
      const assetPath = normalizeBase(url.pathname);

      if (!publicBasePath || assetPath.startsWith(`${publicBasePath}/`) || assetPath === publicBasePath) {
        const relativePath = publicBasePath ? assetPath.slice(publicBasePath.length) : assetPath;
        return decodePathSegments(relativePath);
      }
    }

    const defaultOrigin = `https://${input.accountId}.r2.cloudflarestorage.com`;
    if (url.origin === defaultOrigin) {
      const prefix = `/${input.bucketName}/`;
      if (url.pathname.startsWith(prefix)) {
        return decodePathSegments(url.pathname.slice(prefix.length));
      }
    }
  } catch {
    return null;
  }

  return null;
}
