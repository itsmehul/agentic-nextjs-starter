import type { ComponentType, SVGProps } from "react";
import iconsConfig, { type IconStyle } from "@/icons.config";
import { cn } from "@/shared/lib/utils";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number | string;
};

export type IconComponent = ComponentType<IconProps>;

const FONT_FAMILIES: Record<IconStyle, string> = {
  outlined: "Material Symbols Outlined",
  rounded: "Material Symbols Rounded",
  sharp: "Material Symbols Sharp",
};

const fontFamily = FONT_FAMILIES[iconsConfig.style];

const registeredNames = new Set<string>();

function Icon({
  name,
  size = iconsConfig.size,
  className,
  style,
  ...props
}: IconProps & { name: string }) {
  const labelled = props["aria-label"] != null || props["aria-labelledby"] != null;

  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0", className)}
      fill={iconsConfig.color}
      height={size}
      role={labelled ? "img" : undefined}
      style={{ userSelect: "none", ...style }}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        fontFamily={fontFamily}
        fontSize={24}
        style={{ fontFeatureSettings: "'liga'" }}
        x={0}
        y={24}
      >
        {name}
      </text>
    </svg>
  );
}

function createIcon(name: string, displayName: string): IconComponent {
  registeredNames.add(name);
  const Component = (props: IconProps) => <Icon name={name} {...props} />;
  Component.displayName = displayName;
  return Component;
}

export const AlertCircle = createIcon("error", "AlertCircle");
export const AlertTriangleIcon = createIcon("warning", "AlertTriangleIcon");
export const ArrowDownIcon = createIcon("arrow_downward", "ArrowDownIcon");
export const ArrowLeftIcon = createIcon("arrow_back", "ArrowLeftIcon");
export const ArrowRightIcon = createIcon("arrow_forward", "ArrowRightIcon");
export const ArrowUpIcon = createIcon("arrow_upward", "ArrowUpIcon");
export const BookIcon = createIcon("book", "BookIcon");
export const BookmarkIcon = createIcon("bookmark", "BookmarkIcon");
export const BotIcon = createIcon("smart_toy", "BotIcon");
export const BrainIcon = createIcon("psychology", "BrainIcon");
export const CheckCircle2Icon = createIcon("check_circle", "CheckCircle2Icon");
export const CheckCircleIcon = createIcon("check_circle", "CheckCircleIcon");
export const CheckIcon = createIcon("check", "CheckIcon");
export const ChevronDownIcon = createIcon("keyboard_arrow_down", "ChevronDownIcon");
export const ChevronLeftIcon = createIcon("chevron_left", "ChevronLeftIcon");
export const ChevronRightIcon = createIcon("chevron_right", "ChevronRightIcon");
export const ChevronsUpDownIcon = createIcon("unfold_more", "ChevronsUpDownIcon");
export const ChevronUpIcon = createIcon("keyboard_arrow_up", "ChevronUpIcon");
export const CircleAlertIcon = createIcon("error", "CircleAlertIcon");
export const CircleDotIcon = createIcon("radio_button_checked", "CircleDotIcon");
export const CircleIcon = createIcon("circle", "CircleIcon");
export const CircleSmallIcon = createIcon("radio_button_unchecked", "CircleSmallIcon");
export const ClockIcon = createIcon("schedule", "ClockIcon");
export const Code = createIcon("code", "Code");
export const CopyIcon = createIcon("content_copy", "CopyIcon");
export const CornerDownLeftIcon = createIcon("keyboard_return", "CornerDownLeftIcon");
export const DotIcon = createIcon("fiber_manual_record", "DotIcon");
export const DownloadIcon = createIcon("download", "DownloadIcon");
export const ExternalLinkIcon = createIcon("open_in_new", "ExternalLinkIcon");
export const EyeIcon = createIcon("visibility", "EyeIcon");
export const EyeOffIcon = createIcon("visibility_off", "EyeOffIcon");
export const FileIcon = createIcon("draft", "FileIcon");
export const FileTextIcon = createIcon("description", "FileTextIcon");
export const FolderIcon = createIcon("folder", "FolderIcon");
export const FolderOpenIcon = createIcon("folder_open", "FolderOpenIcon");
export const GitCommitIcon = createIcon("commit", "GitCommitIcon");
export const GlobeIcon = createIcon("language", "GlobeIcon");
export const ImageIcon = createIcon("image", "ImageIcon");
export const Loader2Icon = createIcon("progress_activity", "Loader2Icon");
export const LogOutIcon = createIcon("logout", "LogOutIcon");
export const MarsIcon = createIcon("male", "MarsIcon");
export const MarsStrokeIcon = createIcon("male", "MarsStrokeIcon");
export const MessageCircleIcon = createIcon("chat_bubble", "MessageCircleIcon");
export const MicIcon = createIcon("mic", "MicIcon");
export const MinusIcon = createIcon("remove", "MinusIcon");
export const Monitor = createIcon("desktop_windows", "Monitor");
export const MoonIcon = createIcon("dark_mode", "MoonIcon");
export const MoreHorizontalIcon = createIcon("more_horiz", "MoreHorizontalIcon");
export const Music2Icon = createIcon("music_note", "Music2Icon");
export const NonBinaryIcon = createIcon("asterisk", "NonBinaryIcon");
export const PackageIcon = createIcon("package_2", "PackageIcon");
export const PanelLeftIcon = createIcon("left_panel_open", "PanelLeftIcon");
export const PaperclipIcon = createIcon("attach_file", "PaperclipIcon");
export const PauseIcon = createIcon("pause", "PauseIcon");
export const PlayIcon = createIcon("play_arrow", "PlayIcon");
export const PlusIcon = createIcon("add", "PlusIcon");
export const SearchIcon = createIcon("search", "SearchIcon");
export const SendIcon = createIcon("send", "SendIcon");
export const SparklesIcon = createIcon("auto_awesome", "SparklesIcon");
export const SquareIcon = createIcon("stop", "SquareIcon");
export const SunIcon = createIcon("light_mode", "SunIcon");
export const TerminalIcon = createIcon("terminal", "TerminalIcon");
export const TransgenderIcon = createIcon("transgender", "TransgenderIcon");
export const Trash2Icon = createIcon("delete", "Trash2Icon");
export const VenusAndMarsIcon = createIcon("wc", "VenusAndMarsIcon");
export const VenusIcon = createIcon("female", "VenusIcon");
export const VideoIcon = createIcon("videocam", "VideoIcon");
export const WrenchIcon = createIcon("build", "WrenchIcon");
export const XCircleIcon = createIcon("cancel", "XCircleIcon");
export const XIcon = createIcon("close", "XIcon");

/** Google Fonts stylesheet subset to the icons above and the axes in `icons.config.ts`. */
export function getIconFontHref() {
  const family = fontFamily.replaceAll(" ", "+");
  const { opticalSize, weight, fill, grade } = iconsConfig;
  const names = [...registeredNames].sort().join(",");
  return `https://fonts.googleapis.com/css2?family=${family}:opsz,wght,FILL,GRAD@${opticalSize},${weight},${fill},${grade}&icon_names=${names}&display=block`;
}
