import React from "react";
import JobsList from "@/components/Home/JobsList";

const FavoriteJobs: React.FC = () => {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className='flex justify-center flex-col py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <p className="text-2xl font-bold text-txt-red mb-2">Việc làm đã lưu</p>
            </div>
            <main className="w-full">
                <JobsList gridNumber={1} filters={{}} onlyFavorites={true} />
            </main>
        </div>
    );
};

export default FavoriteJobs;
