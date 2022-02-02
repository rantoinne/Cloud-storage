import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import * as Types from './api.types'

/**
 * The default configuration for the app.
 */
export const DEFAULT_API_CONFIG: AxiosRequestConfig = {
  url: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
}

/**
 * Manages all requests to the API.
 */
export class Api {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  axiosInstance: AxiosInstance

  /**
   * Configurable options.
   */
  config: AxiosRequestConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: AxiosRequestConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  setup() {
    // construct the apisauce instance
    this.axiosInstance = axios.create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: 'application/json',
      },
    })
  }

  /**
   * Gets a list of users.
   */
  async getCharacters(): Promise<Types.GetCharacterResult> {
    // make the api call
    const response: AxiosResponse<any> = await this.axiosInstance.get(`/users`)

    /* TODO handle general HTTP errors here */

    const convertUser = raw => {
      return {
        id: raw.id,
        name: raw.name,
      }
    }

    // transform the data into the format we are expecting
    try {
      const rawUsers = response.data
      const resultUsers: Types.Character[] = rawUsers.map(convertUser)
      return { kind: 'ok', users: resultUsers }
    } catch {
      return { kind: 'bad-data' }
    }
  }
}
