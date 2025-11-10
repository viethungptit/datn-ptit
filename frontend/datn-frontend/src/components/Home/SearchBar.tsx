import React, { useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";

const SearchBar: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [location, setLocation] = useState(searchParams.get("location") || "");

    const handleSearch = () => {
        const newParams = new URLSearchParams(searchParams);


        newParams.delete("keyword");
        newParams.delete("location");


        if (keyword.trim()) newParams.set("keyword", keyword.trim());
        if (location.trim()) newParams.set("location", location.trim());


        navigate(`/jobs?${newParams.toString()}`);
    };

    return (
        <div className="flex items-center mr-10 p-2 rounded-full bg-white border-2">
            <div className="mx-2 flex-1">
                <Input
                    type="text"
                    placeholder="Vị trí tuyển dụng, tên công ty"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="p-2 rounded-lg w-full border-none shadow-none"
                />
            </div>

            <div className="mx-2 min-w-[180px]">
                <Select value={location} onValueChange={(value) => setLocation(value)}>
                    <SelectTrigger className="border-none shadow-none p-3 rounded-full outline-none w-full">
                        <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                        <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button variant="seek" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass mr-1"></i>
                Tìm việc ngay
            </Button>
        </div>
    );
};

export default SearchBar;
