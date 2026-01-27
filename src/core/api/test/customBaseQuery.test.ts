/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let baseImpl: ReturnType<typeof vi.fn>;

// mock de fetchBaseQuery -> función baseImpl controlable
vi.mock("@reduxjs/toolkit/query", () => {
  baseImpl = vi.fn();
  return { fetchBaseQuery: vi.fn(() => baseImpl) };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubEnv("VITE_URL_API", "http://api.test");
});

afterEach(() => vi.unstubAllEnvs());

const mkArgs = () => ({
  args: "/foo",
  api: { dispatch: vi.fn(), getState: vi.fn() } as any,
  extra: {} as any,
});

describe("customFetchBase", () => {
  it("hace logout cuando 401", async () => {
    // 1) importás el módulo del logout y le aplicás spy con implementación vacía
    const logoutMod = await import("../../auth/helper/logoutHandler");
    const logoutSpy = vi
      .spyOn(logoutMod, "logoutUser")
      .mockResolvedValue(undefined);

    // 2) importás el SUT después de setear el spy
    const { default: customFetchBase } = await import("../customBaseQuery");

    baseImpl.mockResolvedValueOnce({ error: { status: 401 } });

    const { args, api, extra } = mkArgs();
    await customFetchBase(args, api, extra);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("hace logout cuando 403", async () => {
    const logoutMod = await import("../../auth/helper/logoutHandler");
    const logoutSpy = vi
      .spyOn(logoutMod, "logoutUser")
      .mockResolvedValue(undefined);

    const { default: customFetchBase } = await import("../customBaseQuery");

    baseImpl.mockResolvedValueOnce({ error: { status: 403 } });

    const { args, api, extra } = mkArgs();
    await customFetchBase(args, api, extra);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("NO hace logout cuando 200", async () => {
    const logoutMod = await import("../../auth/helper/logoutHandler");
    const logoutSpy = vi
      .spyOn(logoutMod, "logoutUser")
      .mockResolvedValue(undefined);

    const { default: customFetchBase } = await import("../customBaseQuery");

    baseImpl.mockResolvedValueOnce({ data: { ok: true } });

    const { args, api, extra } = mkArgs();
    const result = await customFetchBase(args, api, extra);

    expect(result).toEqual({ data: { ok: true } });
    expect(logoutSpy).not.toHaveBeenCalled();
  });
});
