// routes
import { paths } from 'src/routes/paths';

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

export const MAPBOX_API = process.env.NEXT_PUBLIC_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root
