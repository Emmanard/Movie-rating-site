import React from 'react'
import  {  useState, useEffect} from 'react'

export default function Uselocalstoragestate(initialState, keypass) {
    const [value, setvalue] = useState(function(){
        const storedValue = localStorage.getItem(keypass)
        return storedValue? JSON.parse(storedValue):initialState;
      });  

      useEffect(() => {
        localStorage.setItem(keypass, JSON.stringify( value));
      
      
      }, [value,keypass])
 return[value,setvalue]     
}
