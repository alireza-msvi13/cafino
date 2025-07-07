import { CookieOptions } from "express";

export const AccessCookieConfig: CookieOptions = {
    sameSite: 'none',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    maxAge: 1 * 24 * 60 * 60 * 1000,
};

export const RefreshCookieConfig: CookieOptions = {
    sameSite: 'none',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
