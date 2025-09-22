import React from "react";
import SearchBar from "./SearchBar";

const Banner: React.FC = () => {
    return (
        <div
            className="w-full h-[calc(100vh-70px)] flex overflow-hidden px-[100px]"
        >
            <div className="flex-1 flex text-black flex-col justify-center gap-6">
                <div className="text-left">
                    <h1 className="text-5xl font-semibold leading-[60px] mb-2 uppercase text-txt-red">Việc làm hôm nay <br /> Tương lai ngày mai</h1>
                    <p className="text-lg">Nền tảng kết nối nhà tuyển dụng và người tìm việc.</p>
                </div>
                <SearchBar />
            </div>
            <div className="w-1/3 flex items-center justify-center">
                <img src="/Banner.svg" alt="Banner" className="" />
            </div>
        </div>
    );
};

export default Banner;
