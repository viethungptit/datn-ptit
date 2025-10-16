import React from "react";
import JobsList from "@/components/Home/JobsList";

const FavoriteJobs: React.FC = () => {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className='flex justify-center px-[100px] py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <h1 className="text-2xl font-semibold text-txt-red">Việc làm đã lưu</h1>
            </div>
            <main className="w-full">
                <JobsList gridNumber={1} />
            </main>
        </div>
    );
};

export default FavoriteJobs;
