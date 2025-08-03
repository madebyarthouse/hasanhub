import cx from "classnames";
import { Link } from "@remix-run/react";

const TagButton = ({
  label,
  active = false,
  styleVariant = "sidebar",
  href,
  onClick,
}: {
  href: string;
  active?: boolean;
  label: string;
  styleVariant: "sidebar" | "taglist";
  onClick?: () => void;
}) => {
  return (
    <>
      <div className="min-w-min">
        <Link
          to={href}
          onClick={onClick}
          className={cx(
            "border-twitchPurpleLight duration-400 transition-colors border  betterhover:hover:bg-twitchPurple betterhover:hover:text-light inline-block rounded-lg saturate-50 ",
            styleVariant === "sidebar"
              ? "text-base px-3 py-2"
              : "text-base px-2 py-1",
            active
              ? "bg-twitchPurpleLight text-light"
              : "bg-light dark:bg-lightBlack text-twitchPurpleLight"
          )}
        >
          {label}
        </Link>
      </div>
    </>
  );
};

export default TagButton;
