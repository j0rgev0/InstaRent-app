import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { FlexAlignType } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'

type ToastType = 'success' | 'error' | 'info'

const styles = StyleSheet.create({
  baseToastContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '90%',
    alignSelf: 'center' as FlexAlignType,
    overflow: 'hidden',
    minHeight: 60,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  textContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1
  },
  text1Style: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600' as '600',
    marginBottom: 4
  },
  text2Style: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.95
  }
})

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.baseToastContainer, { backgroundColor: '#F5F5F5' }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.text1Style, { color: '#424242' }]}>{text1}</Text>
        <Text style={[styles.text2Style, { color: '#616161' }]}>{text2}</Text>
      </View>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.baseToastContainer, { backgroundColor: '#FAFAFA' }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.text1Style, { color: '#424242' }]}>{text1}</Text>
        <Text style={[styles.text2Style, { color: '#616161' }]}>{text2}</Text>
      </View>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.baseToastContainer, { backgroundColor: '#F0F0F0' }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.text1Style, { color: '#424242' }]}>{text1}</Text>
        <Text style={[styles.text2Style, { color: '#616161' }]}>{text2}</Text>
      </View>
    </View>
  )
}

export const showToast = (type: ToastType, title: string, message: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 6000,
    autoHide: true,
    topOffset: 50,
    bottomOffset: 40
  })
}

export const showSuccessToast = (message: string) => {
  showToast('success', 'Success', message)
}

export const showErrorToast = (message: string) => {
  showToast('error', 'Error', message)
}

export const showInfoToast = (message: string) => {
  showToast('info', 'Info', message)
}

export const showMessageToast = (senderName: string, message: string) => {
  showToast('info', senderName, message)
}
