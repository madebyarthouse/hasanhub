import { useEffect, useState } from "react";

const STORAGE_KEY = "hasanhub:launch-banner-dismissed-2026-08";
const DISMISS_EVENT = "hasanhub:launch-banner-dismiss";
const BANNER_EXPIRES_AT = Date.parse("2026-08-17T00:00:00.000Z"); // end of week (Sun Aug 16)
const ARTHOUSE_BLUE = "#0011ff";

const SOCIAL_LINKS = [
  {
    label: "IG",
    href: "https://www.instagram.com/reel/Db8c6OvooJJ/",
  },
  {
    label: "Twitter",
    href: "https://x.com/madebyarthouse/status/2087560065767084386",
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/chrcit.bsky.social/post/3msvmi23c222x",
  },
] as const;

const isDismissed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const shouldShowBanner = () =>
  Date.now() < BANNER_EXPIRES_AT && !isDismissed();

const LaunchBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowBanner());

    const hide = () => setVisible(false);
    window.addEventListener(DISMISS_EVENT, hide);
    window.addEventListener("storage", hide);

    return () => {
      window.removeEventListener(DISMISS_EVENT, hide);
      window.removeEventListener("storage", hide);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures; banner still closes for this session.
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
    setVisible(false);
  };

  return (
    <div
      className="relative mt-2 w-full pr-8 text-sm font-black leading-snug text-white sm:text-base"
      style={{ backgroundColor: ARTHOUSE_BLUE }}
      role="region"
      aria-label="Launch announcement"
    >
      <p className="px-3 py-2.5">
        I&apos;m starting something new, if you&apos;ve used Hasanhub over the
        years pls watch and like my launch post on{" "}
        {SOCIAL_LINKS.map((link, index) => (
          <span key={link.href}>
            {index > 0 ? " or " : null}
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:opacity-90"
            >
              {link.label}
            </a>
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss launch banner"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center text-lg font-black leading-none text-white hover:opacity-80"
      >
        ×
      </button>
    </div>
  );
};

export default LaunchBanner;
