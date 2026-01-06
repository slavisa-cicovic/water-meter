import { NextRequest, NextResponse } from "next/server";
import { AccountRepository } from "src/repositories/accountRepository";
import { AuthorizationService } from "src/services/authorizationService";
import { TokenService } from "src/services/tokenService";

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = TokenService.parseAccountToken(token);

  if (!payload) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
  }

  const account = await AccountRepository.findById(payload.accountId);
  if (!account) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (account.permissionsVersion !== payload.permissionsVersion) {
    return NextResponse.json({ error: "STALE_TOKEN" }, { status: 401 });
  }

  const permissions = await AuthorizationService.resolveAccountPermissions(account.id);
  const roles = await AuthorizationService.getRoleSlugsForAccount(account.id);
  const primaryRole = roles[0] ?? 'unknown';

  return NextResponse.json({
    user: {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: primaryRole,
      roles,
      verificationStatus: account.verificationStatus,
      permissions,
      permissionsVersion: account.permissionsVersion,
    },
  });
};
