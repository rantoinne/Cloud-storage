import { translate } from '@i18n'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getDateText(timestamp: number) {
  const dateObject = new Date(timestamp)
  const monthName = monthNames[dateObject.getMonth()]
  const day = dateObject.getDate()
  const fullDay = `${day}`
  const year = dateObject.getFullYear()
  const time = `${formatTimeOfDay(dateObject)}`
  const timespan = isToday(dateObject) ? translate('today') : `${monthName} ${fullDay}, ${year}`
  return `${timespan} at ${time}`
}

export function formatTimeOfDay(date, showAmPm = true, padHourWithZero = false, timeSeperator = ':') {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  // the hour '0' should be '12'
  hours = hours || 12
  if (padHourWithZero) {
    hours = hours < 10 ? '0' + hours : hours
  }
  minutes = minutes < 10 ? '0' + minutes : minutes
  const timeOfDay = showAmPm ? ' ' + ampm : ''
  const strTime = hours + timeSeperator + minutes + timeOfDay
  return strTime
}

function isToday(someDate) {
  const today = new Date()
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  )
}

export async function timeOut(secs): Promise<boolean> {
  return new Promise(resolve => setTimeout(() => resolve(true), secs * 1000))
}
