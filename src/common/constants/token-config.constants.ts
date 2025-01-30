import { CookieOptions } from "express";

export const AccessCookieConfig: CookieOptions = {
    sameSite: 'lax',
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
};

export const RefreshCookieConfig: CookieOptions = {
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
