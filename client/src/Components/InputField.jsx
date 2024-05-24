import React from 'react'

function InputField({placeholder}) {
  return (
    <div className='flex justify-center items-center'>
      <input type="text" className='p-2 outline-none h-8' placeholder={placeholder}/>
    </div>
  )
}

export default InputField
