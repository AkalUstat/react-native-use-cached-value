import {useState} from 'react'
import {useDeepCompareEffectNoCheck} from 'use-deep-compare-effect'
import AsyncStorage from '@react-native-community/async-storage'


const useCachedValue = <T>(key: string, initialValue: T): [T, (newValue: T) => Promise<void>] => {
  const [value, setValue] = useState(initialValue)
  useDeepCompareEffectNoCheck( () => {
    AsyncStorage.getItem( key ).then( async ( storedValue ) => {
        if ( !storedValue ) {
          await AsyncStorage.setItem( key, JSON.stringify( initialValue ) )
        }else {
          const parsedValue: T = JSON.parse( storedValue )
          setValue( parsedValue )
        }
      } )
  }, [ initialValue, key ] )

  const cacheNewValue = async ( newValue: T ) => {
    await AsyncStorage.setItem( key, JSON.stringify( newValue ) )
    if ( typeof newValue === 'object' ) {
      // use state doesnt update without this for some reason
      setValue( prev => ( { ...prev, ...newValue } ) )
    } else {
      setValue( newValue )
    }
  }
  return [ value, cacheNewValue ]
}

export {useCachedValue}