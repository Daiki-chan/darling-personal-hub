import { Image as ImageIcon } from "lucide-react";

type MediaPlaceholderProps = {
  label: string;
  aspect?: "portrait" | "landscape" | "square" | "wide";
  tone?: "violet" | "indigo" | "silver";
};

export function MediaPlaceholder({
  label,
  aspect = "landscape",
  tone = "violet",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`media-placeholder media-placeholder--${aspect} media-placeholder--${tone}`}
      role="img"
      aria-label={label}
    >
      <div className="media-placeholder__center">
        <ImageIcon aria-hidden="true" size={24} strokeWidth={1.5} />
        <span>{label}</span>
      </div>
    </div>
  );
}
