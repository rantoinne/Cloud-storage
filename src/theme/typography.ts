import { Platform } from 'react-native'

/*
Available font weights

100 Thin
300 Light
400 Regular
500 Medium
600 SemiBold
700 Bold
*/

export const family = {
  PoppinsBold: Platform.select({
    ios: 'Poppins-Bold', // The font family name
    android: 'Poppins-Bold', // The file name
  }),
  PoppinsLight: Platform.select({
    ios: 'Poppins-Light', // The font family name
    android: 'Poppins-Light', // The file name
  }),
  PoppinsMedium: Platform.select({
    ios: 'Poppins-Medium', // The font family name
    android: 'Poppins-Medium', // The file name
  }),
  PoppinsRegular: Platform.select({
    ios: 'Poppins-Regular', // The font family name
    android: 'Poppins-Regular', // The file name
  }),
  PoppinsSemiBold: Platform.select({
    ios: 'Poppins-SemiBold', // The font family name
    android: 'Poppins-SemiBold', // The file name
  }),
  PoppinsThin: Platform.select({
    ios: 'Poppins-Thin', // The font family name
    android: 'Poppins-Thin', // The file name
  }),
}

export const size = {
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  h7: 12,
  h8: 10,
}
