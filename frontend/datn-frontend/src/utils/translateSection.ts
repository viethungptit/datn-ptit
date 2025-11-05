type SectionId =
    | "avatar"
    | "name"
    | "position"
    | "summary"
    | "personal_info"
    | "skills"
    | "certificates"
    | "experience"
    | "projects"
    | "education";

const SECTION_TRANSLATIONS: Record<SectionId, string> = {
    avatar: "Ảnh đại diện",
    name: "Họ và tên",
    position: "Vị trí ứng tuyển",
    summary: "Tóm tắt bản thân",
    personal_info: "Thông tin cá nhân",
    skills: "Kỹ năng",
    certificates: "Chứng chỉ",
    experience: "Kinh nghiệm làm việc",
    projects: "Dự án",
    education: "Học vấn",
};

export function translateSection(id: SectionId): string {
    return SECTION_TRANSLATIONS[id] || id;
}
