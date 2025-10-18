import Banner from "@/components/Home/Banner";
import React from "react";
import Category from "@/components/Home/Category";
import JobsList from "@/components/Home/JobsList";
import CompaniesList from "@/components/Home/CompaniesList";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center overflow-y-auto">
            <Banner />
            <Category />
            <JobsList gridNumber={3} />
            <CompaniesList />
            <Footer />
        </div>
    );
};

export default Home;
