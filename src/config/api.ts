/**
 * Centralized API configuration.
 *
 * Set the backend URL via the environment variable
 * `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.
 *
 * Example:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
 */
export const API_BASE_URL: string =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm.ku.ac.th/api";
