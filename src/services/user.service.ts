import { http } from '@root/libs/http';

export class UserService {
  static async login(email: string, password: string) {
    const response = await http.post(
      '/v1/user/login',
      { email, password },
      { withCredentials: true }
    );
    console.log(response);
  }
}
