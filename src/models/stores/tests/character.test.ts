import { CharacterStoreModel } from '../character'

test('can be created', () => {
  const instance = CharacterStoreModel.create({})

  expect(instance).toBeTruthy()
})
