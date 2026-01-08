import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { verifyInviteTokenApi, acceptInviteApi } from "@/api/userApi";
import { getCurrentUserProfile } from "@/api/userApi";

type InviteVerifyResponse = {
    valid: boolean;
    userExists: boolean;
    email: string;
    companyId: string;
    role: string;
};

const InvitePage = () => {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [invite, setInvite] = useState<InviteVerifyResponse | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ===============================
    // LOAD INVITE + PROFILE
    // ===============================
    useEffect(() => {
        const init = async () => {
            if (!token) {
                setError("Invite token không tồn tại");
                setLoading(false);
                return;
            }

            try {
                // 1️⃣ verify token
                const inviteRes = await verifyInviteTokenApi(token);
                setInvite(inviteRes.data);

                // 2️⃣ thử lấy profile (nếu chưa login sẽ fail)
                try {
                    const profileRes = await getCurrentUserProfile();
                    setProfile(profileRes.data);
                } catch {
                    setProfile(null);
                }

                // lưu token tạm để dùng sau login/register
                localStorage.setItem("invite_token", token);

            } catch (err: any) {
                setError(err?.response?.data?.message || "Invite không hợp lệ");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [token]);

    // ===============================
    // ACCEPT INVITE
    // ===============================
    const handleAcceptInvite = async () => {
        try {
            await acceptInviteApi(token!);
            localStorage.removeItem("invite_token");
            toast.success("Chấp nhận lời mời thành công");
            navigate("/employer/profile");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Không thể chấp nhận lời mời");
        }
    };

    // ===============================
    // UI STATES
    // ===============================
    if (loading) {
        return (
            <div className="py-20 text-center">
                Đang xác minh lời mời...
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-red-600 mb-4">{error}</h2>
                <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            </div>
        );
    }

    const isLoggedIn = !!profile;
    const emailMatched = isLoggedIn && profile.email === invite.email;

    return (
        <div className="max-w-md mx-auto mt-24 border rounded-xl p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">
                Bạn được mời tham gia công ty
            </h2>

            <div className="text-sm text-gray-600 space-y-1">
                <p>Email được mời: <b>{invite.email}</b></p>
            </div>

            {/* ================= USER CHƯA TỒN TẠI ================= */}
            {!invite.userExists && (
                <>
                    <p>Email này chưa có tài khoản trên hệ thống.</p>
                    <Button
                        onClick={() =>
                            navigate(
                                `/employer/register?email=${invite.email}&redirect=/invite?token=${token}`
                            )
                        }
                    >
                        Đăng ký để tiếp tục
                    </Button>
                </>
            )}

            {/* ================= USER TỒN TẠI NHƯNG CHƯA LOGIN ================= */}
            {invite.userExists && !isLoggedIn && (
                <Button
                    onClick={() =>
                        navigate(`/employer/login?redirect=/invite?token=${token}`)
                    }
                >
                    Đăng nhập để chấp nhận lời mời
                </Button>
            )}

            {/* ================= USER LOGIN NHƯNG SAI EMAIL ================= */}
            {invite.userExists && isLoggedIn && !emailMatched && (
                <p className="text-red-600">
                    Email đăng nhập không khớp email được mời.
                    <br />
                    Vui lòng đăng nhập bằng đúng email.
                </p>
            )}

            {/* ================= USER LOGIN + EMAIL ĐÚNG ================= */}
            {invite.userExists && isLoggedIn && emailMatched && (
                <Button onClick={handleAcceptInvite}>
                    Chấp nhận lời mời
                </Button>
            )}
        </div>
    );
};

export default InvitePage;
