"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

const DEFAULT_SRC = "/uploads/init.svg"

type AppImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null
}

export function AppImage({
  src,
  alt,
  ...props
}: AppImageProps) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_SRC)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(DEFAULT_SRC)}
    />
  )
}
