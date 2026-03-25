import { describe, expect, it, beforeEach } from "vitest";
import { getToken, setToken, removeToken } from "../auth";

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("setToken", () => {
    it("should store token in localStorage", () => {
      // Given: JWT トークン文字列
      const token = "jwt-token-123";

      // When: トークンを保存する
      setToken(token);

      // Then: localStorage にトークンが保存される
      expect(localStorage.getItem("token")).toBe(token);
    });
  });

  describe("getToken", () => {
    it("should return token from localStorage", () => {
      // Given: localStorage にトークンが保存されている
      const token = "jwt-token-123";
      localStorage.setItem("token", token);

      // When: トークンを取得する
      const result = getToken();

      // Then: 保存されたトークンが返る
      expect(result).toBe(token);
    });

    it("should return null when no token is stored", () => {
      // Given: localStorage にトークンが保存されていない

      // When: トークンを取得する
      const result = getToken();

      // Then: null が返る
      expect(result).toBeNull();
    });
  });

  describe("removeToken", () => {
    it("should remove token from localStorage", () => {
      // Given: localStorage にトークンが保存されている
      localStorage.setItem("token", "jwt-token-123");

      // When: トークンを削除する
      removeToken();

      // Then: localStorage からトークンが削除される
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});
