import logoSrc from '../assets/logo.png'

export default function Logo({ size = 40, style = {} }) {
  return (
    <img
      src={logoSrc}
      alt="Admirai Logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', ...style }}
    />
  )
}
