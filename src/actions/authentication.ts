import { decodeToken, Token } from "../utils/decode";
const { VITE_API_URL } = import.meta.env

export class authServices {
static async login(email: string, password: string) {
  const response = await fetch(`${VITE_API_URL}/api/user/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  let data;
  try {
    if (response.status === 204) {
      data = null;
    } else {
      data = await response.json();
    }
  } catch (error) {
    console.error("Fallo al parsear la respuesta JSON del login", error);
    data = null;
  }
  if (!response.ok) {
    const errorMessage = data?.message || 'Error en el inicio de sesión';
    throw new Error(errorMessage);
  }

  if (data && data.token) {
    const tokenData = JSON.stringify(data);
    window.sessionStorage.setItem('jwt', tokenData);
    localStorage.setItem("jwt", tokenData);
  }

  return data;
}

static async logout(jwt: string) {
  if (typeof jwt !== 'string' || jwt.trim() === '') {
    const errorMessage = "La función de logout fue llamada incorrectamente sin un token JWT válido.";
    console.error(errorMessage, "Argumento recibido:", jwt);
    window.sessionStorage.removeItem('jwt');
    localStorage.removeItem('jwt');
    
    window.sessionStorage.removeItem('selectedCompany');
    localStorage.removeItem('selectedCompany');
    window.location.href = '/login';
    throw new TypeError(errorMessage);
  }
  window.sessionStorage.removeItem('jwt');
  localStorage.removeItem('jwt');
  window.sessionStorage.removeItem('selectedCompany');
  localStorage.removeItem('selectedCompany');

  try {
    const response = await fetch(`${VITE_API_URL}/api/user/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); 
      throw new Error(errorData.message || 'Error del servidor al cerrar la sesión.');
    }
    console.log("Logout en el servidor exitoso.");

  } catch (error) {
    console.error('Error durante la llamada de logout al servidor:', error);
  } finally {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

  static async register(formData: FormData) {
    const email_address = formData.get('email');
    const password = formData.get('password');

    const response = await fetch(VITE_API_URL + "/api/user/auth/register", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el registro');
    }

    return await response.json();
  }

  static async verification(token: string) {
    const url = new URL(VITE_API_URL + "/api/auth/activate-account");
    url.searchParams.append('token', token);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la verificación');
    }

    return await response.json();
  }

  static async sendResetEmail(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('newPassword');

    const response = await fetch(VITE_API_URL + "/api/user/auth/sendResetEmail", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar el email de reseteo');
    }

    return await response.json();
  }

  static async sendReset(formData: FormData) {
    const email = formData.get('email');
    const newPassword = formData.get('newPassword');
    const code = formData.get('code');

    const response = await fetch(VITE_API_URL + "/api/user/auth/sendResetPassword", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al resetear la contraseña');
    }

    return await response.json();
  }

  static isTokenExpired(exp: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return exp < currentTime;
  }

  static setCurrentUser() {
    return localStorage.setItem('jwt', JSON.stringify({}));
  }

  static getCurrentUser(): string | null {
    try {
      const decoded = decodeToken();
      const token = Token();
      if (!decoded) {
        sessionStorage.removeItem('jwt');
        window.sessionStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompany');
        return null;
      }

      const isExpired = this.isTokenExpired(decoded?.exp);

      if (isExpired) {
        sessionStorage.removeItem('jwt');
        localStorage.removeItem('jwt');
        window.sessionStorage.removeItem('selectedCompany');
        localStorage.removeItem('selectedCompany');
        return null;
      }

      const sessionJwt = sessionStorage.getItem('jwt');
      if (!sessionJwt) {
        sessionStorage.setItem('jwt', JSON.stringify(decoded));
      }

      return token;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}