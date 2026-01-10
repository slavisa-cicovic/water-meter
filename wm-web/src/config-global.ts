// routes
import { paths } from 'src/routes/paths';

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

export const MAPBOX_API = process.env.NEXT_PUBLIC_MAPBOX_API;

export const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || 'http://localhost:8000/v1/chat/completions';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const NEXT_ALLOWED_DEV_ORIGINS = process.env.NEXT_ALLOWED_DEV_ORIGINS || '';
export const HOSTNAME = process.env.HOSTNAME || '';
export const NEXT_RUNTIME = process.env.NEXT_RUNTIME || '';
export const UPLOADS_DIR = process.env.UPLOADS_DIR || '';

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root
