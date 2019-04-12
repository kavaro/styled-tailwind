# styled-tailwind

Use tailwind classes in styled-components for quick protoyping of consistent designs
without the need for tools like pureCss to remove unused css classes.

## Install

```bash
npm install --save styled-tailwind
```

## Usage 1: default tailwind configuration

```jsx
import React, { Component } from 'react'
import tw from 'styled-tailwind'

const H1 = styled.h1`
  ${tw('bg-red text-white p-5 m-5')}
`

class Example extends Component {
  render () {
    return (
      <H1>Hello world</H1>
    )
  }
}
```

## Usage 2: custom tailwind configuration

```jsx
import React, { Component } from 'react'
import {styledTailwind, defaultTailwindConfig, defaultTailwindColors} from 'styled-tailwind'

const tw = styledTailwind(defaultTailwindConfig({...defaultTailwindColors, primary: '#3490dc', secondary: '#f6993f'}))

const H1 = styled.h1`
  ${tw('bg-secondary text-primary p-5 m-5')}
`

class Example extends Component {
  render () {
    return (
      <H1>Hello world</H1>
    )
  }
}
```

## License

MIT © [kavaro](https://github.com/kavaro)
