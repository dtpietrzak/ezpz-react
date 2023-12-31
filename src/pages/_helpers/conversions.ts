export const amountToDollars = (amount: number) => {
  return `${(amount * 0.01).toFixed(2)}`
}

export const dollarsToAmount = (dollars: string) => {
  return parseInt(
    (parseFloat(dollars.replace(/[^0-9.]/g, '')) * 100).toFixed(0)
  )
}

export const monthNumberToMonthWord = (monthNumber: string) => {
  switch (monthNumber) {
    case '1':
      return 'January'
    case '2':
      return 'February'
    case '3':
      return 'March'
    case '4':
      return 'April'
    case '5':
      return 'May'
    case '6':
      return 'June'
    case '7':
      return 'July'
    case '8':
      return 'August'
    case '9':
      return 'September'
    case '10':
      return 'October'
    case '11':
      return 'November'
    case '12':
      return 'December'
  }
}

export const formattedMonth = (month: number): string => {
  return month < 9 ? `0${month + 1}` : `${month + 1}`
}

export const monthIdToDate = (monthId: string): Date => {
  const year = parseInt(monthId.slice(0, 4))
  const month = parseInt(monthId.slice(5, 7)) - 1
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setFullYear(year)
  date.setMonth(month)
  date.setDate(1)
  return date
}