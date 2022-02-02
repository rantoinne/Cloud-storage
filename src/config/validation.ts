const requiredErrorMsg = fieldName => `^${fieldName} is required.`
const lengthErrorMsg = (fieldName, length) => `^${fieldName} must be ${length} characters long.`

const lengthExactObj = (fieldName, length) => {
  return {
    length: {
      is: length,
      message: lengthErrorMsg(fieldName, length),
    },
  }
}

const presenceObj = fieldName => {
  return {
    presence: {
      message: requiredErrorMsg(fieldName),
      allowEmpty: false,
    },
  }
}

export const signInSchema = {
  handle: {
    ...presenceObj('Account Handle'),
    ...lengthExactObj('Account Handle', 128),
  },
}
