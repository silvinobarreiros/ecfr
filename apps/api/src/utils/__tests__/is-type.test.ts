import isOfType from '../is-type'

describe('isType', () => {
  it('should expose a function', () => {
    expect(isOfType).toBeDefined()
    expect(typeof isOfType).toBe('function')
  })

  it('should return true if all keys are present and have the correct type', () => {
    const obj = {
      foo: 'bar',
      baz: 123,
    }

    expect(isOfType(obj, 'foo', 'baz')).toBe(true)
  })

  it('should return false if keys are missing', () => {
    const obj = {
      foo: 'bar',
    }

    expect(isOfType(obj, 'foo', 'baz')).toBe(false)
  })

  it('should return true if all keys are present and have the correct type', () => {
    type AgreementType = {
      type: string
    }

    const obj: Record<string, any> = {
      type: 'foo',
    }

    expect(isOfType<AgreementType>(obj, 'type')).toBe(true)
  })
})
