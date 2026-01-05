import { NextRequest } from 'next/server';
import { requirePermission, PermissionGuardOk } from './authPermissionGuard';

type Handler = (req: NextRequest, ctx: any, guard: PermissionGuardOk) => Promise<Response>;

type SimpleHandler = (req: NextRequest, ctx?: any) => Promise<Response>;

export function withPermission(permission: string, handler: Handler | SimpleHandler) {
  return async (req: NextRequest, ctx?: any) => {
    const guard = await requirePermission(req, permission);
    if (!guard.ok) {
      return guard.response;
    }

    return handler.length >= 3
      ? (handler as Handler)(req, ctx, guard)
      : (handler as SimpleHandler)(req, ctx);
  };
}
