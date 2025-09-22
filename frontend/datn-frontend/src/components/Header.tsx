import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';

const Header = () => (
    <header className='flex items-center justify-between gap-10 py-3 pl-[100px] pr-[30px] h-[70px] border fixed top-0 left-0 right-0 z-50 bg-white'>
        <img src="/logo-ptit.png" alt="Logo" className='h-[60px] cursor-pointer' />
        <nav className='flex gap-6 uppercase text-sm'>
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Trang chủ</NavLink>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Tuyển dụng</NavLink>
            <NavLink to="/companies" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Công ty</NavLink>
            <NavLink to="/manage-cvs" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Quản lý CV</NavLink>
        </nav>
        <div className='flex gap-3'>
            <NavLink to="/login">
                <Button variant="login">
                    <i className="fa-solid fa-user"></i>
                    Đăng nhập
                </Button>
            </NavLink>
            <NavLink to="/employer/login">
                <Button variant="default">
                    <i className="fa-solid fa-briefcase"></i>
                    Đăng tuyển
                </Button>
            </NavLink>
        </div>
    </header>
);

export default Header;
