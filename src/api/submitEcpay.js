import { api } from '@/api' 

export async function submitEcpay(token, payment) {
  try {
    const res = api.post(
      '/api/v1/users/create-payment',
      payment,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const wrapper = document.createElement('div')
    wrapper.innerHTML = res.data.trim()
    const form = wrapper.querySelector('form')
    document.body.appendChild(form)
    form.submit()

    setTimeout(() => {
      if (form) {
        form.remove()
      }
    }, 1000)
  } catch (error) {
    console.error('付款跳轉失敗:', error)
    throw error
  }
}
