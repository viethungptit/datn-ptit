import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JobsList from "@/components/Home/JobsList";
import SearchBar from "@/components/Home/SearchBar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllGroupJobTags, getAllJobTags } from "@/api/recruitApi";
import { Button } from "@/components/ui/button";


const initialFilters = [
    { key: "industry", label: "Ngành nghề", type: "multi", options: [] },
    { key: "tags", label: "Danh mục công việc", type: "multi", options: [] },
    {
        key: "type",
        label: "Loại hình làm việc",
        type: "radio",
        options: [
            { label: "Toàn thời gian", value: "full_time" },
            { label: "Bán thời gian", value: "part_time" },
            { label: "Thực tập", value: "internship" },
            { label: "Freelance", value: "freelance" },
        ],
    },
    {
        key: "salary",
        label: "Mức lương",
        type: "salaryRange",
        options: [
            { label: "< 7 triệu", min: 0, max: 7 },
            { label: "7 - 10 triệu", min: 7, max: 10 },
            { label: "10 - 15 triệu", min: 10, max: 15 },
            { label: "15 - 20 triệu", min: 15, max: 20 },
            { label: "20 - 30 triệu", min: 20, max: 30 },
            { label: "> 30 triệu", min: 30, max: null },
        ],
    },
    {
        key: "location",
        label: "Địa điểm",
        type: "radio",
        options: [
            { label: "Hà Nội", value: "Hà Nội" },
            { label: "Hồ Chí Minh", value: "Hồ Chí Minh" },
            { label: "Đà Nẵng", value: "Đà Nẵng" },
        ],
    },
    {
        key: "experience",
        label: "Kinh nghiệm làm việc",
        type: "radio",
        options: [
            { label: "Thực tập", value: "intern" },
            { label: "Fresher", value: "fresher" },
            { label: "1-2 năm", value: "1-2" },
            { label: "2-3 năm", value: "2-3" },
            { label: "3-4 năm", value: "3-4" },
            { label: "4-5 năm", value: "4-5" },
            { label: "Hơn 5 năm", value: "5+" },
        ],
    },
];

const SearchJob: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
    const [dynamicFilters, setDynamicFilters] = useState(initialFilters);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [groupRes, tagRes] = await Promise.all([
                    getAllGroupJobTags(),
                    getAllJobTags(),
                ]);

                setDynamicFilters((prev) =>
                    prev.map((f) => {
                        if (f.key === "industry") {
                            return {
                                ...f,
                                options:
                                    groupRes.data?.map((g: any) => ({
                                        label: g.groupJobName,
                                        value: g.groupJobName,
                                    })) || [],
                            };
                        }

                        if (f.key === "tags") {
                            return {
                                ...f,
                                options:
                                    tagRes.data?.map((t: any) => ({
                                        label: t.jobName,
                                        value: t.jobName,
                                    })) || [],
                            };
                        }

                        return f;
                    })
                );
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        fetchFilters();
    }, []);

    useEffect(() => {
        const obj: Record<string, string[]> = {};
        dynamicFilters.forEach((f) => {
            const value = searchParams.getAll(f.key);
            if (value.length > 0) obj[f.key] = value;
        });
        setFilterValues(obj);
    }, [searchParams, dynamicFilters]);

    const updateQueryParam = (key: string, value: string | string[]) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(key);

        if (Array.isArray(value)) {
            value.forEach((v) => newParams.append(key, v));
        } else if (value) {
            newParams.set(key, value);
        }

        setSearchParams(newParams, { replace: true });
    };

    const handleViewAll = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return (
        <div className="flex flex-col gap-8 px-[100px] py-10 overflow-y-auto">
            <SearchBar />
            <div className="flex flex-row justify-between">
                <div className="md:w-1/3 w-full h-fit bg-white rounded-xl shadow p-4 mb-8 md:mb-0 border">
                    <h2 className="text-xl font-semibold mb-6 text-txt-red">Bộ lọc nâng cao</h2>
                    <form className="flex flex-col gap-5">
                        {dynamicFilters.map((filter) => (
                            <div key={filter.key} className="flex flex-col gap-2">
                                <label className="font-medium text-gray-700 mb-1">{filter.label}</label>

                                {/* Multi-select */}
                                {filter.type === "multi" && (
                                    <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
                                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 mt-2">
                                            {filter.options.map((opt: any) => (
                                                <label
                                                    key={opt.value}
                                                    className="flex text-sm items-center gap-2 cursor-pointer min-h-[32px] group"
                                                >
                                                    <Checkbox
                                                        checked={
                                                            filterValues[filter.key]?.includes(opt.value) || false
                                                        }
                                                        onCheckedChange={(checked) => {
                                                            const arr = filterValues[filter.key]
                                                                ? [...filterValues[filter.key]]
                                                                : [];
                                                            let newValues: string[];
                                                            if (checked) newValues = [...arr, opt.value];
                                                            else newValues = arr.filter((v) => v !== opt.value);
                                                            updateQueryParam(filter.key, newValues);
                                                        }}
                                                    />
                                                    <span className="truncate" title={opt.label}>
                                                        {opt.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {filter.type === "radio" && (
                                    <div className="flex flex-col overflow-y-auto max-h-60">
                                        <RadioGroup
                                            value={filterValues[filter.key]?.[0] || ""}
                                            onValueChange={(val) => updateQueryParam(filter.key, val)}
                                            className={`grid ${filter.options.length > 4 ? "grid-cols-2" : "grid-cols-1"
                                                } gap-2`}
                                        >
                                            {filter.options.map((opt: any) => (
                                                <label
                                                    key={opt.value}
                                                    className="flex text-sm items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 transition"
                                                >
                                                    <RadioGroupItem
                                                        value={opt.value}
                                                        className="border-2 border-txt-red data-[state=checked]:bg-txt-red data-[state=checked]:border-txt-red"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                        </RadioGroup>



                                    </div>
                                )}
                                {filter.type === "salaryRange" && (
                                    <div className="flex flex-col gap-3">
                                        <RadioGroup
                                            value={
                                                `${searchParams.get("minSalary") || ""}-${searchParams.get("maxSalary") || ""}`
                                            }
                                            onValueChange={(val) => {
                                                const [min, max] = val.split("-").map((v) => (v ? Number(v) : ""));
                                                const newParams = new URLSearchParams(searchParams);
                                                if (min !== "") newParams.set("minSalary", String(min));
                                                else newParams.delete("minSalary");
                                                if (max !== "") newParams.set("maxSalary", String(max));
                                                else newParams.delete("maxSalary");
                                                setSearchParams(newParams, { replace: true });
                                            }}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {filter.options.map((opt: any) => (
                                                <label
                                                    key={opt.label}
                                                    className="flex text-sm items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 transition"
                                                >
                                                    <RadioGroupItem
                                                        value={`${opt.min || ""}-${opt.max || ""}`}
                                                        className="border-2 border-txt-red data-[state=checked]:bg-txt-red data-[state=checked]:border-txt-red"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                        </RadioGroup>

                                        <div className="flex items-center gap-3 mt-3">
                                            <input
                                                type="number"
                                                placeholder="Từ"
                                                className="w-1/2 border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-txt-red focus:outline-none"
                                                value={searchParams.get("minSalary") || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const newParams = new URLSearchParams(searchParams);
                                                    if (val) newParams.set("minSalary", val);
                                                    else newParams.delete("minSalary");
                                                    newParams.delete("salary");
                                                    setSearchParams(newParams, { replace: true });
                                                }}
                                            />
                                            <span>-</span>
                                            <input
                                                type="number"
                                                placeholder="Đến"
                                                className="w-1/2 border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-txt-red focus:outline-none"
                                                value={searchParams.get("maxSalary") || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const newParams = new URLSearchParams(searchParams);
                                                    if (val) newParams.set("maxSalary", val);
                                                    else newParams.delete("maxSalary");
                                                    newParams.delete("salary");
                                                    setSearchParams(newParams, { replace: true });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <Button onClick={handleViewAll} variant="seek" size="lg" className="mt-10">
                            Xóa bộ lọc
                        </Button>
                    </form>
                </div>

                <main className="w-full">
                    <JobsList
                        filters={Object.fromEntries(searchParams.entries())}
                        gridNumber={1}
                    />
                </main>
            </div>
        </div>
    );
};

export default SearchJob;
