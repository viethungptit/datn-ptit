import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';

const Header = () => (
    <header className='flex items-center justify-between gap-10 py-3 pl-[100px] pr-[30px] h-[70px] border fixed top-0 left-0 right-0 z-50 bg-white'>
        <img src="/logo-ptit.png" alt="Logo" className='h-[60px] cursor-pointer' />
        <nav className='flex gap-6 text-sm uppercase'>
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Trang chủ</NavLink>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Tuyển dụng</NavLink>
            <NavLink to="/companies" className={({ isActive }) => isActive ? 'text-txt-red' : 'hover:text-txt-red'}>Công ty</NavLink>
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
