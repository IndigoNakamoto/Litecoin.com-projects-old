import NextImage, { ImageProps } from 'next/image'

const Image = ({ ...rest }: ImageProps) => (
  <NextImage
    {...rest}
    style={{
      maxWidth: '100%',
      height: 'auto',
    }}
  />
)

export default Image
