import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile, logoutAPI } from '../api/userApi';
import { logout, selectIsAuthenticated } from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated) {
                setProfile(null);
                return;
            }

            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data || res);
            } catch {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await logoutAPI();
        dispatch(logout());
        localStorage.removeItem('accessToken');
        navigate('/');
    };

    return (
        <header className="flex items-center justify-between gap-10 py-3 pl-[100px] pr-[30px] h-[70px] border fixed top-0 left-0 right-0 z-50 bg-white">
            <img src="/logo-ptit.png" alt="Logo" className="h-[60px] cursor-pointer" />
            <nav className="flex gap-6 text-sm uppercase">
                <NavLink to="/" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>
                    Trang chủ
                </NavLink>
                <NavLink to="/jobs" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>
                    Tuyển dụng
                </NavLink>
                <NavLink to="/companies" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>
                    Công ty
                </NavLink>

                <div className="relative group">
                    <button className="hover:text-txt-red uppercase focus:outline-none">Tạo CV</button>
                    <div className="absolute left-0 top-[20px] min-w-[250px] bg-white shadow-lg rounded-md py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                        <NavLink to="/manage-cvs" className="text-left block px-4 py-2 hover:bg-gray-100 text-gray-700">Quản lý CV</NavLink>
                        <NavLink to="/upload-cv" className="text-left block px-4 py-2 hover:bg-gray-100 text-gray-700">Tải lên CV</NavLink>
                        <NavLink to="/cv-templates" className="text-left block px-4 py-2 hover:bg-gray-100 text-gray-700">Mẫu CV</NavLink>
                    </div>
                </div>

                <div className="relative group">
                    <button className="hover:text-txt-red uppercase focus:outline-none">Việc làm</button>
                    <div className="absolute left-0 top-[20px] min-w-[250px] bg-white shadow-lg rounded-md py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                        <NavLink to="/favorite" className="text-left block px-4 py-2 hover:bg-gray-100 text-gray-700">Việc làm đã lưu</NavLink>
                        <NavLink to="/applied" className="text-left block px-4 py-2 hover:bg-gray-100 text-gray-700">Việc làm đã ứng tuyển</NavLink>
                    </div>
                </div>
            </nav>
            <div className="flex gap-3 items-center">
                {!isAuthenticated && (
                    <>
                        <NavLink to="/login">
                            <Button variant="login">
                                <i className="fa-solid fa-user"></i>
                                Đăng nhập
                            </Button>
                        </NavLink>
                    </>
                )}
                {isAuthenticated && (
                    <div className="relative group">
                        <button className="flex items-center gap-2 focus:outline-none">
                            <img
                                src={profile?.avatar || '/avatar-default.svg'}
                                alt="avatar"
                                className="w-8 h-8 border p-1 rounded-full object-cover"
                            />
                            <span className="uppercase text-sm">
                                {profile?.fullName || (loading ? '...' : 'Tài khoản')}
                            </span>
                        </button>
                        <div className="absolute right-0 top-[30px] min-w-[220px] text-sm bg-white shadow-lg rounded-md py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                            <NavLink to="/profile" className="text-left block px-4 py-2 hover:bg-gray-100 uppercase text-gray-700">Hồ sơ của tôi</NavLink>
                            <NavLink to="/manage-cvs" className="text-left block px-4 py-2 hover:bg-gray-100 uppercase text-gray-700">Quản lý CV</NavLink>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 uppercase text-gray-700">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
