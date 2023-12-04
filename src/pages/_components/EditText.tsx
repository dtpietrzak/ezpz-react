import * as React from 'react'

import { Text, TextInput, TextProps } from '@mantine/core'
import { FC, useEffect, useState } from 'ezpz'
import { useClickOutside } from '@mantine/hooks'

const EditText: FC<TextProps & {
  prefix?: string,
  suffix?: string,
  value: string,
  onSave: (newVal: string) => void,
  onChange?: (newVal: string) => void,
}> = ({
  prefix,
  suffix,
  value,
  onSave,
  onChange,

  ...props
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [tempString, setTempString] = useState<string>(value)
    const ref = useClickOutside(() => close())

    const close = () => {
      onSave(tempString)
      setIsEditing(false)
    }
    
    useEffect(() => {
      setTempString(value)
    }, [value])

    if (!isEditing) return (
      <Text
        {...props}
        onClick={() => setIsEditing(true)}
      >
        {prefix}{tempString}{suffix}
      </Text>
    )

    return (
      <TextInput
        ref={ref}
        value={tempString}
        onChange={(e) => { 
          setTempString(e.target.value)
          if (onChange) onChange(e.target.value)
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter') close()
        }}
        onBlur={() => close()}
        size='md'
      />
    )
  }

export default EditText