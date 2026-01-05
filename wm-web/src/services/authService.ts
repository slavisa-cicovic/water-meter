import { NextResponse } from "next/server";
import prisma from "src/utils/prisma";
import { TokenService } from "./tokenService";
import { AuthorizationService } from "./authorizationService";
import { VerificationStatus } from "src/types/accounts";

type LoginInput = {
  identifier: string;
  password: string;
};

export const AuthService = {
  async login({ identifier, password }: LoginInput) {
    const account = await prisma.account.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
    }

    // TODO: use password hash/compare
    if (account.passwordHash !== password) {
      return NextResponse.json({ success: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    if (account.verificationStatus !== "verified") {
      return NextResponse.json({ success: false, error: "ACCOUNT_NOT_VERIFIED" }, { status: 403 });
    }

    const permissions = await AuthorizationService.resolveAccountPermissions(account.id);

    return NextResponse.json({
      success: true,
      data: {
        accessToken: TokenService.issueAccountToken({
          id: account.id,
          role: account.role,
          verificationStatus: account.verificationStatus as VerificationStatus,
          permissionsVersion: account.permissionsVersion,
        }),
        user: {
          id: account.id,
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          address: account.address,
          role: account.role,
          verificationStatus: account.verificationStatus,
          permissions,
          permissionsVersion: account.permissionsVersion,
        },
      },
    });
  },

  async forgotPassword(identifier: string) {
    // We don't send real email yet; respond success to avoid user enumeration.
    const exists = await prisma.account.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      select: { id: true },
    });

    if (!exists) {
      // Return generic success to avoid leaking existence
      return NextResponse.json({ success: true });
    }

    // TODO: generate reset token/email integration
    return NextResponse.json({ success: true });
  },
};
