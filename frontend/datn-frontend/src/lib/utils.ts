// Utility function to concatenate class names
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Utility function to format ISO date strings to "dd/mm/yyyy"
export const formatTime = (iso: string) => {
  const d = new Date(iso.replace(" ", "T"));
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past + 7 * 60 * 60 * 1000; // Điều chỉnh múi giờ GMT+7 (nếu cần)

    if (diffMs < 10) return "Vừa xong"; // Trường hợp thời gian trong tương lai

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    // Nếu muốn hiển thị lâu hơn thì trả về dạng ngày/tháng/năm
    return past.toLocaleDateString("vi-VN");
}