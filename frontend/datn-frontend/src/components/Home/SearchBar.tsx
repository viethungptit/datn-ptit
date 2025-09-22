import React from "react";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate("/jobs");
    }
    return (
        <div className="flex items-center mr-10 p-2 rounded-full bg-white border-2">
            <div className="mx-2 flex-1">
                <Input type="text" placeholder="Vị trí tuyển dụng, tên công ty" className="p-2 rounded-lg w-full border-none shadow-none" />
            </div>
            <div className="mx-2 min-w-[180px]">
                <Select>
                    <SelectTrigger className="border-none shadow-none p-3 rounded-full outline-none w-full">
                        <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hanoi">Hà Nội</SelectItem>
                        <SelectItem value="HCM">Hồ Chí Minh</SelectItem>
                        <SelectItem value="Danang">Đà Nẵng</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button variant="seek" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass"></i>
                Tìm việc ngay
            </Button>
        </div>
    );
};

export default SearchBar;
