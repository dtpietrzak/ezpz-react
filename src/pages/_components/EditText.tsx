import * as React from 'react'

import { Text, TextInput, TextProps } from '@mantine/core'
import { FC, cm, useEffect, useState } from 'ezpz'
import { useClickOutside } from '@mantine/hooks'
import { LoadStatus } from 'ezpz/types'

// TODO: should pull out this cool loading UI stuff into a hook

const EditText: FC<TextProps & {
  loadStatus: LoadStatus,
  prefix?: string,
  suffix?: string,
  value: string,
  valueOnEdit?: string,
  onSave: (newVal: string) => void,
  onChange?: (newVal: string) => void,
}> = ({
  loadStatus,
  prefix,
  suffix,
  value,
  valueOnEdit,
  onSave,
  onChange,

  ...props
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [tempString, setTempString] = useState<string>(value)
    const ref = useClickOutside(() => close())
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)
    const [init, setInit] = useState<boolean>(false)

    const close = () => {
      if (tempString === value) {
        setIsEditing(false)
        return
      }
      setLoaded(false)
      setIsLoading(true)
      onSave(tempString)
      setIsEditing(false)
    }

    useEffect(() => {
      setTempString(value)
    }, [value])

    useEffect(() => {
      if (init) {
        if (loadStatus === 'success') {
          if (isLoading) setLoaded(true)
          setIsLoading(false)
        }
        if (loadStatus === 'error') {
          setIsLoading(false)
        }
      } else {
        setInit(true)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadStatus])

    useEffect(() => {
      if (isEditing) {
        setTempString(valueOnEdit ?? value)
        ref.current?.select()
      } else {
        setTempString(value)
      }
    }, [isEditing, ref, value, valueOnEdit])

    if (!isEditing) return (
      <Text
        {...props}
        className={cm(
          props.className,
          isLoading && 'loading',
          loaded && 'loaded',
        )}
        onClick={() => setIsEditing(true)}
      >
        {prefix}{tempString}{suffix}
      </Text>
    )

    return (
      <TextInput
        autoCorrect='false'
        autoComplete='false'
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