import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { getCurrentUserProfile, logoutAPI } from '@/api/userApi'
import { logout, selectIsAuthenticated, selectRole } from '@/redux/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import {
    SidebarProvider,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarFooter,
} from './ui/sidebar'

interface Props {
    collapsed: boolean
    onToggle: () => void
    headerOffset: number
}

const Sidebar: React.FC<Props> = ({ collapsed, onToggle, headerOffset }) => {
    const widthClass = collapsed ? 'w-[60px]' : 'w-1/6'
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const role = useSelector(selectRole)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated) {
                setProfile(null)
                return
            }

            setLoading(true)
            try {
                const res = await getCurrentUserProfile()
                setProfile(res.data || res)
            } catch {
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [isAuthenticated])

    const handleLogout = async () => {
        await logoutAPI()
        dispatch(logout())
        localStorage.removeItem('accessToken')
        navigate('/')
    }

    const onOpenChange = (open: boolean) => {
        if (open === collapsed) {
            onToggle()
        }
    }

    return (
        <aside
            className={`fixed left-0 z-20 border-r-2 shadow-sm overflow-hidden transition-all duration-200 ${widthClass}`}
            style={{ top: headerOffset, height: `calc(100vh - ${headerOffset}px)` }}
        >
            <SidebarProvider open={!collapsed} onOpenChange={onOpenChange}>
                <div className="flex flex-col w-full h-screen bg-transparent relative">
                    <SidebarHeader>
                        <div className={`flex items-center gap-3 p-1 border-b-2 ${collapsed && 'pl-1'}`}>
                            <img src="/logo-ptit.png" alt="Logo" className="h-[30px] cursor-pointer" />
                            {!collapsed && (
                                <span className="text-sm truncate">{profile?.fullName || (loading ? '...' : 'Tài khoản')}</span>
                            )}
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        {role === 'employer' && (
                            <nav className={`flex-1 text-sm ${collapsed && 'pl-1'}`}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/employer/profile"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className={`fa-solid fa-user`}></i>
                                            {!collapsed && <span>Hồ sơ của tôi</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/employer/jobs"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className={`fa-solid fa-briefcase`}></i>
                                            {!collapsed && <span>Quản lý tin tuyển dụng</span>}
                                        </NavLink>
                                    </SidebarMenuItem>

                                    {/* Tính năng chỉ dành cho admin của công ty */}
                                    {profile?.employer?.admin && profile?.employer?.status === "VERIFIED" && (
                                        <SidebarMenuItem>
                                            <NavLink
                                                to={`/employer/employers`}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                                }
                                            >
                                                <i className="fa-solid fa-users"></i>
                                                {!collapsed && <span>Quản lý nhân viên</span>}
                                            </NavLink>
                                            <NavLink
                                                to={`/employer/reports`}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                                }
                                            >
                                                <i className="fa-solid fa-file-waveform"></i>
                                                {!collapsed && <span>Báo cáo tháng</span>}
                                            </NavLink>
                                        </SidebarMenuItem>
                                    )}
                                </SidebarMenu>
                            </nav>
                        )}

                        {role === 'admin' && (
                            <nav className={`flex-1 text-sm ${collapsed && 'pl-1'}`}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/dashboard"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className={`fa-solid fa-chart-line`}></i>
                                            {!collapsed && <span>Trang chủ</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/users"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-users"></i>
                                            {!collapsed && <span>Quản lý người dùng</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/companies"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-building"></i>
                                            {!collapsed && <span>Quản lý công ty</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/jobs"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-briefcase"></i>
                                            {!collapsed && <span>Quản lý việc làm</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/tags"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-tag"></i>
                                            {!collapsed && <span>Quản lý thẻ</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/cvs"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-file-import"></i>
                                            {!collapsed && <span>Quản lý CV</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/templates"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-file"></i>
                                            {!collapsed && <span>Quản lý mẫu CV</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/notifications"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-bell"></i>
                                            {!collapsed && <span>Quản lý thông báo</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/notification-templates"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-envelope"></i>
                                            {!collapsed && <span>Quản lý mẫu thông báo</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/notification-emails"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-at"></i>
                                            {!collapsed && <span>Quản lý thông báo email</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <NavLink
                                            to="/admin/logs"
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <i className="fa-solid fa-terminal"></i>
                                            {!collapsed && <span>Quản lý nhật ký</span>}
                                        </NavLink>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </nav>
                        )}
                    </SidebarContent>

                    <div className="w-full absolute bottom-5">
                        <SidebarFooter>
                            <div className="flex flex-col gap-2">
                                <Button className="w-full" variant="default" onClick={handleLogout}>
                                    {!collapsed ? 'Đăng xuất' : <i className="fa-solid fa-right-from-bracket"></i>}
                                </Button>

                                <div className="flex justify-center">
                                    <Button
                                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                        size="icon"
                                        className='w-full bg-background-red text-text-white hover:bg-red-700'
                                        onClick={onToggle}
                                    >
                                        {collapsed ? <i className="fa-xl fa-solid fa-lg fa-caret-right"></i> : <i className="fa-xl fa-solid fa-lg fa-caret-left"></i>}
                                    </Button>
                                </div>
                            </div>
                        </SidebarFooter>
                    </div>
                </div>
            </SidebarProvider>
        </aside>
    )
}

export default Sidebar
