import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { TokenService } from "src/services/tokenService";
import { MobileService } from "src/services/mobileService";
import { BillingService } from "src/services/billingService";
import { SettingsService } from "src/services/settingsService";

import { GET as mobileGet, PUT as mobilePut } from "src/app/api/mobile/route";
import { GET as consumptionGet } from "src/app/api/mobile/consumption/route";
import { GET as billingGet } from "src/app/api/mobile/billing/route";
import { GET as notificationsGet } from "src/app/api/mobile/notifications/route";
import { GET as metersGet } from "src/app/api/mobile/meters/route";
import { GET as paymentsGet, POST as paymentsPost } from "src/app/api/mobile/payments/route";
import { GET as readingsGet, POST as readingsPost } from "src/app/api/mobile/readings/route";

const mockAuth = (role: string = "consumer") => {
  vi.spyOn(TokenService, "parseAccountToken").mockReturnValue({
    accountId: "acc-1",
    role,
    verificationStatus: "verified",
    issuedAt: new Date().toISOString(),
  } as any);
};

describe("API /mobile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET returns 401 without Authorization", async () => {
    const req = new NextRequest("http://localhost/api/mobile", { method: "GET" });
    const res = await mobileGet(req as any);
    expect(res.status).toBe(401);
  });

  it("GET returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "getAccount").mockResolvedValue({
      success: true,
      data: { id: "acc-1" },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    const res = await mobileGet(req as any);
    expect(res.status).toBe(200);
  });

  it("PUT returns 400 on validation error", async () => {
    mockAuth();
    vi.spyOn(MobileService, "updateProfile").mockResolvedValue({
      success: false,
      error: "VALIDATION_FAILED",
      details: { email: ["Required"] },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile", {
      method: "PUT",
      headers: { Authorization: "Bearer token" },
    } as any);
    (req as any).json = async () => ({ email: "" });

    const res = await mobilePut(req as any);
    expect(res.status).toBe(400);
  });
});

describe("API /mobile/consumption", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid year", async () => {
    mockAuth();
    const req = new NextRequest("http://localhost/api/mobile/consumption?year=1990", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
    const res = await consumptionGet(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "getConsumption").mockResolvedValue({
      success: true,
      data: { year: 2024, chart: [], rows: [] },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/consumption?year=2024", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
    const res = await consumptionGet(req as any);
    expect(res.status).toBe(200);
  });
});

describe("API /mobile/billing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid year", async () => {
    mockAuth();
    const req = new NextRequest("http://localhost/api/mobile/billing?year=1990", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
    const res = await billingGet(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "getBilling").mockResolvedValue({
      success: true,
      data: { year: 2024, chart: [], rows: [] },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/billing?year=2024", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
    const res = await billingGet(req as any);
    expect(res.status).toBe(200);
  });
});

describe("API /mobile/notifications", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "getNotifications").mockResolvedValue({
      success: true,
      data: { hasIssuedInvoice: false },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/notifications", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
    const res = await notificationsGet(req as any);
    expect(res.status).toBe(200);
  });
});

describe("API /mobile/meters", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 403 when not staff_field", async () => {
    mockAuth("consumer");
    vi.spyOn(MobileService, "getStaffMeters").mockResolvedValue({
      success: false,
      error: "FORBIDDEN",
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/meters", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    const res = await metersGet(req as any);
    expect(res.status).toBe(403);
  });

  it("returns 200 for staff_field", async () => {
    mockAuth("staff_field");
    vi.spyOn(MobileService, "getStaffMeters").mockResolvedValue({
      success: true,
      data: { meters: [] },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/meters", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    const res = await metersGet(req as any);
    expect(res.status).toBe(200);
  });
});

describe("API /mobile/payments", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "getLatestIssuedInvoice").mockResolvedValue({
      success: true,
      data: { invoice: null },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/payments", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    const res = await paymentsGet(req as any);
    expect(res.status).toBe(200);
  });

  it("POST returns 400 when invoiceId missing", async () => {
    mockAuth();

    const req = new NextRequest("http://localhost/api/mobile/payments", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    } as any);
    (req as any).json = async () => ({});

    const res = await paymentsPost(req as any);
    expect(res.status).toBe(400);
  });

  it("POST returns 200 on success", async () => {
    mockAuth();
    vi.spyOn(BillingService, "markInvoicePaid").mockResolvedValue({
      success: true,
      data: { updated: 1 },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/payments", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    } as any);
    (req as any).json = async () => ({ invoiceId: "inv-1" });

    const res = await paymentsPost(req as any);
    expect(res.status).toBe(200);
  });

  it("POST returns 400 when invoice status is not issued", async () => {
    mockAuth();
    vi.spyOn(BillingService, "markInvoicePaid").mockResolvedValue({
      success: false,
      error: "INVALID_STATUS",
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/payments", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    } as any);
    (req as any).json = async () => ({ invoiceId: "inv-1" });

    const res = await paymentsPost(req as any);
    expect(res.status).toBe(400);
  });
});

describe("API /mobile/readings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET passes meterId to service", async () => {
    mockAuth("staff_field");
    vi.spyOn(MobileService, "getReadingContext").mockResolvedValue({
      success: true,
      data: { meter: null, previousPaidValue: 0, meters: [] },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/readings?meterId=m1", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    const res = await readingsGet(req as any);
    expect(res.status).toBe(200);
    expect(MobileService.getReadingContext).toHaveBeenCalledWith("acc-1", "staff_field", "m1");
  });

  it("POST returns 201 on success", async () => {
    mockAuth();
    vi.spyOn(MobileService, "createReading").mockResolvedValue({
      success: true,
      data: { reading: { id: "r1" } },
    } as any);
    vi.spyOn(SettingsService, "getEffectiveDate").mockResolvedValue({
      success: true,
      data: new Date(),
    } as any);
    vi.spyOn(BillingService, "generateDraftForMeter").mockResolvedValue({
      success: true,
      data: { created: true },
    } as any);

    const req = new NextRequest("http://localhost/api/mobile/readings", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    } as any);
    (req as any).json = async () => ({
      meterId: "m1",
      method: "manual",
      value: 120,
      originalValue: 120,
    });

    const res = await readingsPost(req as any);
    expect(res.status).toBe(201);
  });
});
