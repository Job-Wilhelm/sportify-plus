import { api } from '@/api' 

export async function cancelPayment(token, MerchantTradeNo) {
  try {
    const res = api.post(
      '/api/v1/users/cancel-payment',
      {
        merchant_trade_no: MerchantTradeNo
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    console.log(res)
  } catch (error) {
    console.error('取消扣款失敗:', error)
    throw error
  }
}
