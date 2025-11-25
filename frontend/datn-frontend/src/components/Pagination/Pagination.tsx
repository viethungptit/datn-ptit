import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    const goToPrev = () => {
        if (currentPage > 0) onPageChange(currentPage - 1);
    };

    const goToNext = () => {
        if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
    };

    return (
        <div className="flex items-center justify-center mt-10 gap-3">
            <button
                className={`px-4 py-2 rounded border ${currentPage === 0
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                    }`}
                onClick={goToPrev}
                disabled={currentPage === 0}
            >
                Trước
            </button>

            <span className="px-4 py-2 bg-white rounded border">
                Trang {currentPage + 1} / {totalPages}
            </span>

            <button
                className={`px-4 py-2 rounded border ${currentPage === totalPages - 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100"
                    }`}
                onClick={goToNext}
                disabled={currentPage === totalPages - 1}
            >
                Sau
            </button>
        </div>
    );
};

export default Pagination;
