// Admin password check (set ADMIN_PASSWORD in .env.local). Runs on the server only.
export const isAdmin = (pw) => !!pw && pw === (process.env.ADMIN_PASSWORD || 'admin123');
