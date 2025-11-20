import { Icon } from "@iconify/react";

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export default function AppIcon({
  name,
  size = 22,
  color = "currentColor",
  className,
}: AppIconProps) {
  return <Icon icon={name} width={size} height={size} color={color} className={className} />;
}
