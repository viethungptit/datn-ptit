import React from "react";

const Footer: React.FC = () => {
    return (
        <section className="bg-footer py-14 px-[100px] bg-background-footer">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* PTIT Info */}
                    <div className="md:col-span-1">
                        <div className="footer-item">
                            <span className="text-white mb-4 text-xl text-left font-semibold block">Học viện Công nghệ Bưu chính Viễn thông</span>
                            <p className="text-white/70 text-sm text-left">TSC: 122 Hoàng Quốc Việt, Q.Cầu Giấy, Hà Nội.</p>
                            <p className="text-white/70 text-sm text-left">Cơ sở đào tạo tại Hà Nội: Km10, Đường Nguyễn Trãi, Q.Hà Đông, Hà Nội</p>
                            <ul className="flex gap-3 mt-2">
                                <li><a href="#" target="_blank" rel="noopener noreferrer"><i className="mdi mdi-linkedin text-white text-2xl" /></a></li>
                                <li><a href="#" target="_blank" rel="noopener noreferrer"><i className="mdi mdi-facebook text-white text-2xl" /></a></li>
                                <li><a href="#" target="_blank" rel="noopener noreferrer"><i className="mdi mdi-youtube text-white text-2xl" /></a></li>
                            </ul>
                        </div>
                    </div>
                    {/* Ứng viên */}
                    <div>
                        <div className="footer-item">
                            <p className="text-white text-base text-left font-semibold mb-4">Ứng viên</p>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Việc làm</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Việc làm đã lưu</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Việc làm đã ứng tuyển</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Công ty</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Ngành nghề</a></li>
                            </ul>
                        </div>
                    </div>
                    {/* Nhà tuyển dụng */}
                    <div>
                        <div className="footer-item">
                            <p className="text-white text-base text-left font-semibold mb-4">Nhà tuyển dụng</p>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Tổng quan</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Tài khoản</a></li>
                                <li><a href="#" className="text-white/80 flex text-sm items-center"><i className="mdi mdi-chevron-right mr-1" />Công ty</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Footer;
