import { getAllTemplates } from "@/api/recruitApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type CVTemplate = {
    templateId: string;
    name: string;
    previewUrl: string;
};

const CVTemplatesList = () => {
    const [cvTemplates, setTemplateCVs] = useState<CVTemplate[]>([]);
    const navigate = useNavigate();

    const fetchCVTemplates = async () => {
        const res = await getAllTemplates();
        setTemplateCVs(res.data);
    };

    const navigateToTemplate = (templateId: string) => {
        navigate(`/cv-templates/${templateId}`);
    };

    useEffect(() => {
        fetchCVTemplates();
    }, []);


    return (
        <div className="h-full flex flex-col justify-between">
            <div className='flex flex-row px-[100px] py-16' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <div className='w-full'>
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-txt-red mb-2">Các mẫu CV nổi bật mới nhất 2025</p>
                        <p className="text-base text-gray-700">Hãy chọn một mẫu CV phù hợp với bạn nhất để có thể nổi bật trong mắt nhà tuyển dụng.</p>
                    </div>
                </div>
            </div>
            <div className="px-[100px] py-8">
                <div className="grid grid-cols-4 gap-8">
                    {
                        cvTemplates.length === 0 ? (
                            <p className="text-center col-span-4">Không có mẫu CV hệ thống nào</p>
                        ) :
                            (
                                cvTemplates.map(template => (
                                    <div key={template.templateId} className="border rounded-lg shadow p-4 flex flex-col">
                                        <img src={`${MINIO_ENDPOINT}/datn/${template.previewUrl}`} alt={template.name} className="w-full h-[300px] object-cover rounded mb-3" />
                                        <span className="font-semibold text-left text-lg mb-2">{template.name}</span>
                                        <Button variant="seek" size="lg" className="w-full max-w-sm mt-4" onClick={() => navigateToTemplate(template.templateId)}>Dùng mẫu</Button>
                                    </div>
                                ))
                            )
                    }
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CVTemplatesList;
