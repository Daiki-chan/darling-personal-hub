import { AlertTriangle } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";

export function ConfigAlert() {
  const status = getSupabaseConfigStatus();

  if (status.isConfigured) {
    return null;
  }

  return (
    <div className={styles.bannerAlert} role="alert">
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: "#ffffff" }} />
      <div>
        <div className={styles.bannerAlertTitle}>
          [ THÔNG BÁO HẠ TẦNG ] CẦN CẤU HÌNH THÔNG SỐ KẾT NỐI SUPABASE
        </div>
        <p style={{ margin: "4px 0 8px 0", color: "var(--adm-text-secondary)", fontSize: "0.8rem" }}>
          Hệ thống Quản trị yêu cầu kết nối với instance Supabase cá nhân để kích hoạt PostgreSQL, RLS và Storage Buckets. Hiện các biến sau chưa được khai báo:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {status.missing.map((key) => (
            <span key={key} className={styles.bannerAlertCode}>
              {key}
            </span>
          ))}
          {!status.hasServiceRoleKey ? (
            <span key="SUPABASE_SERVICE_ROLE_KEY" className={styles.bannerAlertCode}>
              SUPABASE_SERVICE_ROLE_KEY (khuyên dùng cho server migrations & storage)
            </span>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--adm-text-muted)", fontFamily: "var(--font-mono), monospace" }}>
          Khai báo các biến trên trong <code>.env.local</code> hoặc trên Vercel Project Settings để mở khóa toàn bộ tính năng quản trị.
        </p>
      </div>
    </div>
  );
}
