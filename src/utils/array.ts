import { SortByOrderType, SortByType } from '@models/stores'
import { getSnapshot } from 'mobx-state-tree'

/*
  example:
  input: /path/to/the/directory
  output: /
          /path
          /path/to
          /path/to/directory
*/
export function getPathSequence(_path) {
  if (_path[0] !== '/') throw Error('Path must start with a forward slash!')
  if (_path.length === 1) return ['/']

  let path = _path
  if (path.substr(-1) === '/') {
    path = path.slice(0, -1)
  }

  const se = path.split('/')
  se.shift()

  const finalSe = se.map((_, index) => {
    return '/' + se.slice(0, index + 1).join('/')
  })
  return finalSe
}

export const getRandomList = (_array, length) => {
  const choosen = {}
  const rands = []
  const array = [..._array]
  while (rands.length < length) {
    const rand = Math.floor(Math.random() * length)
    if (!choosen[rand]) rands.push(rand)
  }
  return rands.map(randIndex => array[randIndex])
}

export type PhraseData = {
  correct: string
  position: number
  words: string[]
}

export const getRandomPhrases = (_array: Array<string>): PhraseData[] => {
  const phraseData: PhraseData[] = []
  const shuffled = [..._array].sort(() => 0.5 - Math.random())
  const toCheck = [...shuffled].slice(0, 4)
  Array(4)
    .fill(0)
    .forEach((_, i) => {
      phraseData.push({
        words: [...shuffled]
          .slice(i + 4, 3 + i + 4)
          .concat(toCheck[i])
          .sort(() => 0.5 - Math.random()),
        position: _array.findIndex(m => m === toCheck[i]),
        correct: toCheck[i],
      })
    })
  return phraseData
}

export const sortByProperty = (sortType: SortByType, sortOrder: SortByOrderType) => (a: any, b: any) => {
  if (sortOrder === 'desc') return b[sortType] > a[sortType] ? 1 : -1
  return b[sortType] < a[sortType] ? 1 : -1
}

export const reduceArrayToObjectByKey = (key: string, arr: Array<any>): { [x: string]: any } => {
  return arr.reduce((acc, curr) => {
    acc[curr[key]] = curr
    return acc
  }, {})
}

interface HasPathProp {
  path: string
}

export function groupListByPropPath<T extends HasPathProp>(arr: T[]): { [x: string]: T[] } {
  return arr.reduce((acc, curr) => {
    const path = curr.path
    if (!acc[path]) acc[path] = []
    acc[path].push(curr)
    return acc
  }, {})
}

interface HasUriProp {
  uri: string
}
export function reduceListByPropUri<T extends HasUriProp>(arr: T[]): { [uri: string]: T } {
  return arr.reduce((acc, curr) => {
    acc[curr.uri] = curr
    return acc
  }, {})
}

export function refMapKeysToList(refMap) {
  return Array.from(refMap, ([uriKey]) => uriKey)
}
