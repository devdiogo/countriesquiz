import { VectorMap } from '@south-paw/react-vector-maps'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import world from './data/countries.json'
import { createGlobalStyle } from 'styled-components'
import { ChangeEvent, MouseEvent, useRef, useState } from 'react'
import useSound from 'use-sound'
import successSound from './assets/sounds/success.mp3'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import * as S from './App.styled'

// filter info not needed in the VectorMap component to avoid an error
let countries = { ...world, layers: world.layers.map(({allowedNames, locked, ...rest}) => rest) } 

let unlockedCountries = world.layers.filter(el=>!el.locked)

type Country = {
  id: string 
  name: string
  allowedNames: string[]
}

function App() {

  const { width, height } = useWindowSize()

  const [playSuccessSound] = useSound(successSound, { volume: 1 })

  const [clicked, setClicked] = useState('none')
  const [validCountries, setValidCountries] = useState<Country[]>(unlockedCountries.map(c => { 
    return {
      id: c.id, 
      name: c.name.toLowerCase(),
      allowedNames: c.allowedNames
    } 
  }))
  const [guessedCountries, setGuessedCountries] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isGameOver = guessedCountries.length == unlockedCountries.length

  const SC = createGlobalStyle`
      ${guessedCountries.map(country => `
        svg path[id='${country}'] {
          fill: #436b3f !important;
        }
      `)}
  `

  const getCountryIdByAllowedName = (allowedName: string) =>  {
    return validCountries[validCountries.findIndex(c => c.allowedNames.includes(allowedName))]!.id
  }

  // flatten array of allowed names into only one array
  let flattenValidCountries = Array.prototype.concat.apply([], validCountries.map(c => c.allowedNames))

  const isValidCountry = (countryName: string) => {
    return flattenValidCountries.includes(countryName)
  }

  const proccessInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return
    let {value} = e.target
    value = value.toLowerCase()
    if(isValidCountry(value)) {
      setIsProcessing(true)
      setGuessedCountries([...guessedCountries, getCountryIdByAllowedName!(value)])
      playSuccessSound()
      setValidCountries(validCountries.filter(c => !c.allowedNames.includes(value)))
      inputRef.current!.value = ''
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <SC />
      <TransformWrapper >
        {({ zoomIn, zoomOut, zoomToElement, centerView, resetTransform, ...rest }) => (
          <>
            {isGameOver && <Confetti className="absolute" width={width} height={height} />}
            <div className="absolute w-full mx-auto top-10 left-0 right-0 z-10 flex justify-center">
              <input disabled={isGameOver} className="w-2/6 h-16 text-2xl text-white placeholder-white rounded-tl-lg rounded-bl-lg outline-none border-0 border-r-0 bg-gray-400 px-5
              disabled:bg-neutral-500 disabled:placeholder-neutral-200 disabled:cursor-not-allowed" type="text" ref={inputRef} onChange={proccessInput} placeholder="Type the name of a country" autoFocus />
              <div className="bg-neutral-900 text-white flex justify-center items-center px-4 border-stone-700 rounded-tr-lg rounded-br-lg">{guessedCountries.length} / {unlockedCountries.length}</div>
            </div>
            <div className="absolute bottom-3 left-3 z-10 bg-white">
              <button className="btn border-l-[1px]" onClick={() => zoomIn()}><svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line><line x1="128" y1="40" x2="128" y2="216" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line></svg></button>
              <button className="btn" onClick={() => zoomOut()}><svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line></svg></button>
              <button className="btn" onClick={() => resetTransform()}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="176.2 99.7 224.2 99.7 224.2 51.7" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></polyline><path d="M190.2,190.2a88,88,0,1,1,0-124.4l34,33.9" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></path></svg></button>
            </div>
            <TransformComponent>
              <S.Map>
                <VectorMap
                  layerProps={{
                    onClick: (event: MouseEvent) => setClicked((event.target as SVGPathElement).attributes.getNamedItem('name')!.value)
                  }}
                  checkedLayers={['BR']}
                  currentLayers={['US']}
                  {...countries}
                />
              </S.Map>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

export default App