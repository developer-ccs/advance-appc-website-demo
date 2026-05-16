import Image, { ImageProps } from "next/image";

type ProtectedImageProps = ImageProps & {
  priority?: boolean;
  wrapperClassName?: string;
};

export default function ProtectedImage({
  priority = false,
  wrapperClassName = "",
  fill,
  ...props
}: ProtectedImageProps) {
  return (
    <div
      className={wrapperClassName}
      style={{
        position: "relative",
        // When fill is used, stretch to fill the parent
        ...(fill
          ? { width: "100%", height: "100%" }
          : { display: "inline-flex" }),
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        {...props}
        fill={fill}
        priority={priority}
        draggable={false}
        style={{
          userSelect: "none",
          ...props.style,
        }}
      />

      {/* Transparent overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}
