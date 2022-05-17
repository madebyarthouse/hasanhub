import cx from "classnames";
import { Link } from "@remix-run/react";

const TagButton = ({
  label,
  active = false,
  styleVariant = "sidebar",
  href,
}: {
  href: string;
  active?: boolean;
  label: string;
  styleVariant: "sidebar" | "taglist";
}) => {
  return (
    <>
      <div className="min-w-max">
        <Link
          to={href}
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
