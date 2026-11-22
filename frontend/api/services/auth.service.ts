const API_URL = "http://127.0.0.1:8000/api";

// Types
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

interface AuthErrorResponse {
    detail?: string;
    non_field_errors?: string[];
}

// دریافت توکن ذخیره‌شده
export const getAccessToken = () => {
    return localStorage.getItem("access_token");
};

// ثبت‌نام
export const register = async (data: RegisterData): Promise<AuthUser> => {
    const response = await fetch(`${API_URL}/accounts/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(result));
    }

    return result;
};

// ورود

export const login = async (data: LoginData): Promise<TokenResponse> => {
    const response = await fetch(`${API_URL}/accounts/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error: AuthErrorResponse = await response.json();

        const errorMessage =
            error.detail ||
            error.non_field_errors?.[0] ||
            "نام کاربری یا رمز عبور اشتباه است.";

        throw new Error(errorMessage);
    }

    const result: TokenResponse = await response.json();

    localStorage.setItem("access_token", result.access);
    localStorage.setItem("refresh_token", result.refresh);

    return result;
};


// تمدید توکن
export const refreshAccessToken = async (): Promise<string> => {
    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) {
        throw new Error("Refresh token not found.");
    }

    const response = await fetch(`${API_URL}/accounts/token/refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error("Failed to refresh token.");
    }

    localStorage.setItem("access_token", result.access);

    if (result.refresh) {
        localStorage.setItem("refresh_token", result.refresh);
    }

    return result.access;
};

// دریافت اطلاعات کاربر واردشده
export const getCurrentUser = async (): Promise<AuthUser> => {
    let token = getAccessToken();

    if (!token) {
        throw new Error("User is not authenticated.");
    }

    let response = await fetch(`${API_URL}/accounts/me/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    // اگر Access Token منقضی شده باشد، آن را تمدید می‌کنیم
    if (response.status === 401) {
        token = await refreshAccessToken();

        // ارسال دوباره درخواست با توکن جدید
        response = await fetch(`${API_URL}/accounts/me/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    if (!response.ok) {
        throw new Error("Failed to get user information.");
    }

    return response.json();
};

// خروج از حساب
export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};
