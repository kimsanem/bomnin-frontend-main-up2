export const isEmbeddedBrowserEnvironment = (
  userAgent?: string,
  referrer?: string,
) => {
  const ua = userAgent || '';
  const ref = referrer || '';

  const isExplicitInApp = /FBAN|FBAV|Instagram|Messenger|Line\/|MicroMessenger|Telegram|TikTok|Snapchat|Zalo|FB_IAB/i.test(ua);
  const isAndroidWebView = /; wv\)|\bwv\b|Version\/[\d.]+.*Chrome\/[\d.]+ Mobile/i.test(ua);
  const isIosInApp = /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua);
  const hasInAppReferrer = /t\.me|telegram|l\.facebook\.com|lm\.facebook\.com|instagram\.com|messenger|tiktok|snapchat|zalo/i.test(ref);

  return isExplicitInApp || isAndroidWebView || isIosInApp || hasInAppReferrer;
};
