import CoinWhite from './coin-white.svg'
import CoinBlue from './coin-blue.svg'
import CoinBlueWhiteL from './Coin Blue with White L.svg'

const components = {
  coinBlue: CoinBlue,
  coinWhite: CoinWhite,
  coinBlueL: CoinBlueWhiteL,
}

const LitecoinIcon = ({ kind, size = 20 }) => {
  const LitecoinSVG = components[kind]

  return (
    <div>
      <span className="sr-only">{kind}</span>
      <LitecoinSVG
        className={`fill-current text-gray-100 h-${size} w-${size}`}
      />
    </div>
  )
}

export default LitecoinIcon
