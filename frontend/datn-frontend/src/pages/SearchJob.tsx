import React, { useState } from "react";
import JobsList from "@/components/Home/JobsList";
import SearchBar from "@/components/Home/SearchBar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const filters = [
    { label: "Ngành nghề", type: "multi", options: ["Công nghệ thông tin", "Kinh doanh", "Thiết kế", "Giáo dục", "Y tế", "Xây dựng", "Luật", "Marketing"] }, // group_job_tags
    { label: "Danh mục công việc", type: "multi", options: ["React", "JavaScript", "CSS", "UI/UX", "Kế toán", "Ngôn ngữ", "Marketing"] }, // job_tags
    { label: "Loại hình làm việc", type: "radio", options: ["Fulltime", "Parttime", "Internship", "Freelance"] }, // job_type
    { label: "Mức lương", type: "radio", options: ["< 7 triệu", "7-10 triệu", "10-15 triệu", "15-20 triệu", "20-30 triệu", "> 30 triệu"] }, // salary_range
    { label: "Địa điểm", type: "radio", options: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"] }, // location/city
];

const SearchJob: React.FC = () => {
    const [filterValues, setFilterValues] = useState<(string | string[])[]>(filters.map(() => []));

    const handleChange = (idx: number, value: string | string[]) => {
        setFilterValues(values => values.map((v, i) => (i === idx ? value : v)));
    };

    return (
        <div className="flex flex-col gap-8 px-[100px] py-10 overflow-y-auto">
            <SearchBar />
            <div className="flex flex-row justify-between">
                <div className="md:w-1/3 w-full h-fit bg-white rounded-xl shadow p-4 mb-8 md:mb-0 border">
                    <h2 className="text-xl font-semibold mb-6 text-txt-red">Bộ lọc nâng cao</h2>
                    <form className="flex flex-col gap-5">
                        {filters.map((filter, idx) => (
                            <div key={filter.label} className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 mb-1">{filter.label}</label>
                                {/* Multi-select for ngành nghề, tag công việc */}
                                {filter.type === "multi" && (
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            type="text"
                                            placeholder={`Nhập hoặc chọn ${filter.label.toLowerCase()}...`}
                                            value={Array.isArray(filterValues[idx]) && filterValues[idx].length > 0 ? filterValues[idx][0] : ""}
                                            onChange={e => {
                                                const arr = Array.isArray(filterValues[idx]) ? [...filterValues[idx]] : [];
                                                arr[0] = e.target.value;
                                                handleChange(idx, arr);
                                            }}
                                        />
                                        <div className={`grid grid-cols-2 gap-x-4 gap-y-2 mt-2`}>
                                            {filter.options.map(opt => (
                                                <label key={opt} className="flex text-sm items-center gap-2 cursor-pointer min-h-[32px] group">
                                                    <Checkbox
                                                        checked={Array.isArray(filterValues[idx]) ? filterValues[idx].includes(opt) : false}
                                                        onCheckedChange={checked => {
                                                            let arr = Array.isArray(filterValues[idx]) ? [...filterValues[idx]] : [];
                                                            if (checked) arr.push(opt);
                                                            else arr = arr.filter(v => v !== opt);
                                                            handleChange(idx, arr);
                                                        }}
                                                    />
                                                    <span className="truncate max-w-[120px]" title={opt}>{opt}</span>
                                                    <span className="absolute z-10 left-[15%] -translate-x-1/2 mt-8 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition">
                                                        {opt}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Radio button cho các bộ lọc còn lại */}
                                {filter.type === "radio" && (
                                    <RadioGroup
                                        value={typeof filterValues[idx] === "string" ? filterValues[idx] as string : ""}
                                        onValueChange={val => handleChange(idx, val)}
                                        className={`grid ${filter.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}
                                    >
                                        {filter.options.map(opt => (
                                            <label key={opt} className="flex text-sm items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 transition">
                                                <RadioGroupItem value={opt} className="border-2 border-txt-red data-[state=checked]:bg-txt-red data-[state=checked]:border-txt-red" />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </RadioGroup>
                                )}
                            </div>
                        ))}
                    </form>
                    <button type="button" className="mt-8 w-full py-2 rounded bg-txt-red text-white font-semibold hover:bg-red-700 transition-colors">Áp dụng bộ lọc</button>
                </div>
                <main className="w-full">
                    <JobsList gridNumber={1} />
                </main>
            </div>
        </div>
    );
};

export default SearchJob;
