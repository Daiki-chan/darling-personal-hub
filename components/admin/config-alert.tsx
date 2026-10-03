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
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div className={styles.bannerAlertTitle}>MISSING CONFIGURATION — YÊU CẦU CẤU HÌNH SUPABASE</div>
        <p style={{ margin: "4px 0 8px 0" }}>
          Hệ thống Admin Dashboard cần kết nối với dự án Supabase thực tế. Hiện tại các biến môi trường sau chưa được cung cấp:
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
        <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.85 }}>
          Vui lòng thêm các biến trên vào file <code>.env.local</code> hoặc bảng biến môi trường Vercel. Sau khi thêm biến, các tính năng lưu trữ PostgreSQL, xác thực Supabase Auth và tải lên audio vào Storage sẽ hoạt động trực tiếp.
        </p>
      </div>
    </div>
  );
}
