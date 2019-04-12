import tw from './index'
import {styledTailwind, defaultTailwindConfig, defaultTailwindColors} from './index'

describe('styled-tailwind', () => {
  it('should provide default tailwind config', () => {
    const styles = tw('bg-red text-white p-5 m-5')
    expect(styles).toBe('background-color:#e3342f;color:#ffffff;padding:1.25rem;margin:1.25rem;')
  })
  it('should allow to override default colors and/or default tailwind config', () => {
    const tw = styledTailwind(defaultTailwindConfig({...defaultTailwindColors, primary: '#3490dc', secondary: '#f6993f'}))
    const styles = tw('bg-primary text-secondary p-5 m-5')
    expect(styles).toBe('background-color:#3490dc;color:#f6993f;padding:1.25rem;margin:1.25rem;')
  })
})