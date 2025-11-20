import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
    { name: "Công nghệ thông tin", icon: "fa-solid text-txt-red fa-laptop-code" },
    { name: "Kinh doanh", icon: "fa-solid text-txt-red fa-chart-line" },
    { name: "Thiết kế", icon: "fa-solid text-txt-red fa-paint-brush" },
    { name: "Giáo dục", icon: "fa-solid text-txt-red fa-graduation-cap" },
    { name: "Y tế", icon: "fa-solid text-txt-red fa-notes-medical" },
    { name: "Xây dựng", icon: "fa-solid text-txt-red fa-building" },
    { name: "Luật", icon: "fa-solid text-txt-red fa-gavel" },
    { name: "Marketing", icon: "fa-solid text-txt-red fa-bullhorn" },
];

const Category: React.FC = () => {
    const navigate = useNavigate();

    const handleSearch = (name: string) => {
        const encoded = encodeURIComponent(name);
        navigate(`/jobs?industry=${encoded}`);
    }

    return (
        <div className="w-full px-[100px] py-14 flex flex-col items-center bg-gray-100">
            <h2 className="text-3xl font-semibold mb-10 text-txt-red">Ngành nghề nổi bật</h2>
            <div className="grid grid-cols-4 gap-8 w-full">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow transition-transform 
                        cursor-pointer border-2 border-gray-100 min-h-[220px] hover:scale-105 hover:border-background-red"
                        onClick={() => handleSearch(cat.name)}
                    >
                        <span className="text-5xl mb-4">
                            <i className={cat.icon}></i>
                        </span>
                        <span className="text-lg font-semibold text-center">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Category;
