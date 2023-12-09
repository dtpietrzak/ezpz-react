import { notifications } from "@mantine/notifications"

export const isValidAmount = (amount: number | string) => {
  if (!amount) {
    notifications.show({
      title: 'No amount entered',
      message: 'Please enter an amount',
      color: 'red',
      autoClose: 2000,      
    })
    return false
  }
  if (typeof amount === 'string') {
    amount = parseFloat(amount)
  }
  if (isNaN(amount)) {
    notifications.show({
      title: 'Invalid amount',
      message: 'Please enter a valid amount',
      color: 'red',
      autoClose: 2500,
    })
    return false
  }
  return true
}