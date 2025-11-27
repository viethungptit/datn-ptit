import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteCompanyApi, getAllCompaniesApiWithPagination, verifyCompanyApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import CompanyDialog from "@/components/Company/CompanyDialog";
import EmployerDialog from "@/components/Company/EmployerDialog";
import Pagination from "@/components/Pagination/Pagination";

export type Company = {
    companyId: string;
    companyName: string;
    industry?: string;
    companySize?: number;
    location?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    coverImgUrl?: string;
    createdAt?: string;
    verified?: boolean;
};


const CompanyManagement = () => {

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogCompany, setDialogCompany] = useState<Company | null>(null);
    const [employerDialogOpen, setEmployerDialogOpen] = useState(false);
    const [employerDialogCompanyId, setEmployerDialogCompanyId] = useState<string | null>(null);
    const [employerDialogCompanyName, setEmployerDialogCompanyName] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    // no route navigation needed for employee dialog
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllCompaniesApiWithPagination(page, pageSize);
                if (!res || !res.data) throw new Error("Failed to fetch companies");
                setCompanies(res.data.content);
                setTotalPages(res.data.totalPages);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách công ty";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, [page, pageSize]);
    const handleManageEmployees = (companyId: string, companyName: string) => {
        setEmployerDialogCompanyId(companyId);
        setEmployerDialogCompanyName(companyName);
        setEmployerDialogOpen(true);
    };
    const openDialogCompany = (company?: Company) => {
        setDialogCompany(company ?? null);
        setOpenDialog(true);
    };

    const handleDelete = async (companyId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa công ty này?")) return;
        try {
            await deleteCompanyApi(companyId);
            setCompanies(companies.filter(c => c.companyId !== companyId));
            toast.success("Đã xóa công ty");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const handleVerify = async (companyId: string) => {
        try {
            const res = await verifyCompanyApi(companyId);
            const updated = res?.data;
            setCompanies(companies.map(c => (c.companyId === companyId ? { ...c, ...updated } as Company : c)));
            toast.success("Đã xác thực công ty");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xác thực thất bại";
            toast.error(msg);
        }
    };

    const handleDialogSaved = (saved: any) => {
        if (!saved) return;
        // if dialogCompany was set, we updated an existing company; otherwise it was a create
        if (dialogCompany && dialogCompany.companyId) {
            setCompanies(companies.map(c => (c.companyId === dialogCompany.companyId ? { ...c, ...saved } as Company : c)));
        } else {
            setCompanies(prev => (saved ? [...prev, saved] : prev));
        }
        setOpenDialog(false);
    };


    return (
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý công ty</h2>
                <Button variant="login" size="sm" onClick={() => openDialogCompany()}>Thêm công ty</Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Tên công ty</TableHead>
                            <TableHead className="text-left">Logo</TableHead>
                            <TableHead className="text-center">Ngành nghề</TableHead>
                            <TableHead className="text-center">Quy mô</TableHead>
                            <TableHead className="text-left">Xác thực</TableHead>
                            <TableHead className="text-left">Ngày tạo</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            companies.map((c) => (
                                <TableRow key={c.companyId}>
                                    <TableCell className="text-left">{c.companyName}</TableCell>
                                    <TableCell className="text-left">
                                        <img
                                            alt="Company Logo"
                                            className="h-12 object-cover"
                                            src={c.logoUrl ? `${MINIO_ENDPOINT}/datn/${c.logoUrl}` : '/default-logo.png'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center py-6">{c.industry}</TableCell>
                                    <TableCell className="text-center">{c.companySize ?? ''}</TableCell>
                                    <TableCell className="text-left">{c.verified ? 'Đã xác thực' : 'Chưa xác thực'}</TableCell>
                                    <TableCell className="text-left">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleManageEmployees(c.companyId, c.companyName)}>
                                                Quản lý
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => openDialogCompany(c)}>Sửa</Button>
                                            {!c.verified && <Button size="sm" variant="secondary" onClick={() => handleVerify(c.companyId)}>Xác thực</Button>}
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.companyId)}>Xóa</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="absolute bottom-3 right-0 left-0">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </div>

            <CompanyDialog open={openDialog} onOpenChange={setOpenDialog} company={dialogCompany ?? undefined} onSaved={handleDialogSaved} />
            <EmployerDialog
                open={employerDialogOpen}
                onOpenChange={(v) => {
                    setEmployerDialogOpen(v);
                    if (!v) setEmployerDialogCompanyId(null);
                }}
                companyId={employerDialogCompanyId ?? undefined}
                companyName={employerDialogCompanyName ?? undefined}
            />
        </div>
    );
};

export default CompanyManagement;
