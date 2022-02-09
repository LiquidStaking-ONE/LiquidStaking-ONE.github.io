import * as React from 'react'


export function CustomInput(props: any) {
  const inputRef = React.useRef<any>(null)

  const updateValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget

    if (value === '') {
      props.setValue(value)
      return
    }

    // valid is => 1, 1.2, 1.222222(upto 18 decimals), 1. (to let people type)
    // invalid is negative items, .123 (missing 0), non float
    let check = /^\d+(\.)?\d{0,18}$/.test(value)
    if (!check) {
      return
    }

    let split: Array<string> = value.split('.')
    if (split.length > 2) {
      return
    }

    if (split.length === 2) {
      let decimal: string = split[1]
      if (decimal.length > props.decimals) {
        return
      }
    }
    
    props.setValue(value)
  }

  React.useEffect(() => {
    if (props.autofocus && inputRef) {
      const node = inputRef.current as HTMLInputElement
      node.focus()
    }
  }, [props.autofocus, inputRef])

  const inputProps = {
    placeholder: props.placeholder,
    onChange: updateValue,
    type: 'text',
    value: props.value,
  }

  return <input {...inputProps} ref={inputRef}/>
}
