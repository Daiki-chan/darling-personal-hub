"use client";

import { useActionState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { signInAdminAction } from "@/app/admin/actions/auth-actions";

export function LoginForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAdminAction, null);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {state?.error ? (
        <div
          role="alert"
          style={{
            background: "var(--adm-surface-3)",
            border: "1px solid var(--adm-line-strong)",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 2,
            fontSize: "0.78rem",
            fontFamily: "var(--font-mono), monospace",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>[ ! ]</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
        <label className={styles.formLabel} htmlFor="admin-email">
          Email Quản trị
        </label>
        <div style={{ position: "relative" }}>
          <Mail
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@darling.internal"
            className={styles.formInput}
            style={{ paddingLeft: 36, fontFamily: "var(--font-mono), monospace", fontSize: "0.8rem" }}
            disabled={!isConfigured || isPending}
          />
        </div>
      </div>

      <div className={styles.formGroup} style={{ marginBottom: 4 }}>
        <label className={styles.formLabel} htmlFor="admin-password">
          Mật khẩu
        </label>
        <div style={{ position: "relative" }}>
          <Lock
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className={styles.formInput}
            style={{ paddingLeft: 36, fontFamily: "var(--font-mono), monospace", fontSize: "0.8rem" }}
            disabled={!isConfigured || isPending}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`${styles.btn} ${styles.btnPrimary}`}
        disabled={!isConfigured || isPending}
        style={{ marginTop: 8, height: 40, width: "100%" }}
      >
        <span>{isPending ? "Đang xác thực bảo mật..." : "Đăng nhập Dashboard"}</span>
        <ArrowRight size={14} />
      </button>
    </form>
  );
}
