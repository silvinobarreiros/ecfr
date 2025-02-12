import axios, { AxiosRequestConfig } from 'axios'
import camelcaseKeys from 'camelcase-keys'

import { BACKEND_APP_API_KEY, ENV, HOST_API } from 'src/config-global'
import { ListValidator, Validator } from '@/types/utils'

// ----------------------------------------------------------------------

const axiosInstance = ENV === 'development' ? axios.create({ baseURL: HOST_API }) : axios.create()

axiosInstance.interceptors.request.use((config) => {
  config.headers['X-API-KEY'] = BACKEND_APP_API_KEY

  if (!config.url || ENV === 'development') return config

  // Remove leading and trailing slashes
  const cleanUrl = config.url.replace(/^\/+|\/+$/g, '')
  const cleanPrefix = 'api'.replace(/^\/+|\/+$/g, '')

  // Combine with single slashes
  config.url = `/${cleanPrefix}/${cleanUrl}`

  return config
})

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
)

export default axiosInstance

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args]

  const res = await axiosInstance.get(url, { ...config })

  if (res.data) {
    return camelcaseKeys(res.data, { deep: true })
  }

  return res.data
}

export const fetcherWithValidation =
  <T>(func: Validator<T>) =>
  async (args: string | [string, AxiosRequestConfig]) => {
    const [url, config] = Array.isArray(args) ? args : [args]
    const res = await axiosInstance.get(url, { ...config })

    if (res.data) {
      const parsed = camelcaseKeys(res.data, { deep: true })
      const data = func(parsed) ? parsed : undefined

      return data
    }

    throw new Error('malformed packet')
  }

export const fetcherWithListValidation =
  <T>(func: ListValidator<T>) =>
  async (args: string | [string, AxiosRequestConfig]) => {
    const [url, config] = Array.isArray(args) ? args : [args]
    const res = await axiosInstance.get(url, { ...config })

    if (res.data) {
      const parsed = camelcaseKeys(res.data, { deep: true })
      const data = func(parsed) ? parsed : undefined

      return data
    }

    throw new Error('malformed packet')
  }

// ----------------------------------------------------------------------

export const endpoints = {
  analytics: {
    overview: () => '/overview',
    agencies: {
      list: () => '/agencies',
      get: (slug: string) => `/agencies/${slug}`,
      historical: (slug: string, startDate: string) =>
        `/agencies/${slug}/historical?startDate=${startDate}`,
      wordCounts: (slug: string) => `/agencies/${slug}/word-counts`,
      burden: (slug: string) => `/agencies/${slug}/burden`,
    },
    titles: {
      list: () => '/titles',
      get: (number: number) => `/titles/${number}`,
      complexity: (number: number) => `/titles/${number}/complexity`,
      advanced: (number: number) => `/titles/${number}/advanced`,
    },
  },
}
