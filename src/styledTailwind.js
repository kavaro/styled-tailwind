import staticStyles from './static-styles'
import dynamicStyles from './dynamic-styles'
import isString from 'is-string'

function dset(obj, keys, val) {
  keys.split && (keys = keys.split('.'))
  var i = 0,
    l = keys.length,
    t = obj,
    x
  for (; i < l; ++i) {
    x = t[keys[i]]
    t = t[keys[i]] = i === l - 1 ? val : x == null ? {} : x
  }
}

function dlv(obj, key, def, p) {
  p = 0
  key = key.split ? key.split('.') : key
  while (obj && p < key.length) obj = obj[key[p++]]
  return obj === undefined || p < key.length ? def : obj
}

/**
   * the empty comment is to
   * work around a bug somewhere along this chain:
   * styled-jsx -> styled-jsx-plugin-postcss -> postcss-nested
   *
   * code similar to this doesn’t work as expected:
   * .foo {
   *   ${'color: red'};
   *   &:hover {
   *     ${'color: blue'};
   *   }
   * }
   */
function objToString(obj) {
  return Object.keys(obj).reduce((acc, k) => {
    let value = obj[k]

    if (typeof value === 'string' || typeof value === 'number') {
      if (value[0] === '$') {
        value = '${' + value.substr(1) + '}'
      }
      return acc + camelToKebab(k) + ':' + value + ';'
    } else {
      value = objToString(value)
      let key = k[0] === ':' ? '&' + k : k
      key = key[0] === '`' ? key.substr(1, key.length - 2) : key
      return acc + camelToKebab(key) + '{' + value + '};'
    }
  }, '')
}

function camelToKebab(val) {
  return val
    .replace(/[A-Z]/g, '-$&')
    .toLowerCase()
    .replace(/^(ms|o|moz|webkit)-/, '-$1-')
}

function getEnds(x) {
  let pre = ''
  let post = ''
  if (x.pre) {
    pre = x.pre
  }
  if (x.post) {
    post = x.post
  }

  return { pre, post }
}

function merge(a, b) {
  return Object.assign({}, a, b)
}

/**
 * 
 * @param {object} config tailwind configuration
 */
export default function factory(config) {
  return classNames => {
    if (isString(classNames)) {
      classNames = classNames.split(' ').filter(className => !!className)
    }
    const styles = classNames.reduce((acc, className) => {
      let mods = []
      let modifier

      while (modifier !== null) {
        modifier = className.match(/^([a-z-_]+):/i)
        if (modifier) {
          className = className.substr(modifier[0].length)
          mods.push(modifier[1])
        }
      }

      mods = mods.map(mod => {
        if (mod === 'hover' || mod === 'focus' || mod === 'active') {
          return ':' + mod
        }
        return '@media (min-width: ' + config.screens[mod] + ')'
      })

      if (staticStyles[className]) {
        if (mods.length) {
          dset(acc, mods, merge(dlv(acc, mods, {}), staticStyles[className]))
          return acc
        } else {
          return merge(acc, staticStyles[className])
        }
      }

      let key
      Object.keys(dynamicStyles).some(k => {
        if (className.startsWith(k + '-') || className === k) {
          key = k
          return true
        }
      })
      if (key) {
        let value = className.substr(key.length + 1)
        if (value === '') value = 'default'
        let props

        if (Array.isArray(dynamicStyles[key])) {
          let propVal = dynamicStyles[key].map(x => {
            const { pre, post } = getEnds(x)

            if (config[x.config][value] === undefined) return

            const format = x.format ? x.format : x => x

            return {
              [x.prop]:
                pre || post
                  ? pre + format(config[x.config][value]) + post
                  : format(config[x.config][value])
            }
          })
          props = propVal.filter(x => typeof x !== 'undefined')[0]
        } else {
          props = Array.isArray(dynamicStyles[key].prop)
            ? dynamicStyles[key].prop
            : [dynamicStyles[key].prop]
          const { pre, post } = getEnds(dynamicStyles[key])
          const format = dynamicStyles[key].format
            ? dynamicStyles[key].format
            : x => x
          props = props.reduce((acc, prop) => {
            return {
              ...acc,
              [prop]: pre + format(config[dynamicStyles[key].config][value]) + post
            }
          }, {})
        }

        if (mods.length) {
          dset(acc, mods, merge(dlv(acc, mods, {}), props))
          return acc
        } else {
          return merge(acc, props)
        }
      }

      return acc
    }, {})

    return objToString(styles)//.replace(/"-"\+/g, '-')
  }
}