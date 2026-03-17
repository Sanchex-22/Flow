import axios, { AxiosInstance } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export class userServices {
  axiosInstance: AxiosInstance;
  constructor(jwt: string) {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async getAllUsers(companyCode: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/users/full/${companyCode}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
