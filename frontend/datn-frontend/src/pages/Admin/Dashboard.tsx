import { useEffect, useState } from 'react';
import { getSystemHealthApi, getStatsApi, getAlertRecipients, createAlertRecipients } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { animated, useSpring } from '@react-spring/web'

type SystemHealth = {
    serviceName: string;
    status: 'UP' | 'DOWN' | string;
    lastHeartbeat: string;
    cpuUsage: number;
    memoryUsage: number;
};

type Stats = Record<string, any> & { collectedAt?: string };

const statTiles = () => [
    { key: 'totalAdmins', label: 'Quản trị viên' },
    { key: 'totalCandidates', label: 'Ứng viên' },
    { key: 'totalEmployers', label: 'Nhà tuyển dụng' },
    { key: 'totalJobs', label: 'Công việc' },
    { key: 'activeJobs', label: 'Công việc đang mở' },
    { key: 'totalCompanies', label: 'Công ty' },
    { key: 'pendingJobs', label: 'Công việc chờ duyệt' },
    { key: 'totalApplies', label: 'Số đơn ứng tuyển' },
    { key: 'totalCvs', label: 'Số lượng CV' },
    { key: 'jobTagsCount', label: 'Danh mục công việc' },
    { key: 'groupJobTagsCount', label: 'Danh mục ngành nghề' },
    { key: 'emailDeliCount', label: 'Số email đã gửi' },
];

export default function Dashboard() {

    const [services, setServices] = useState<SystemHealth[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [svcRes, statsRes] = await Promise.all([getSystemHealthApi(), getStatsApi()]);
            setServices(svcRes.data ?? []);
            setStats(statsRes.data ?? null);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        window.scrollTo(0, 0);
    }, []);

    // email stats for pie chart (fallback to 0 if missing)
    const emailSuccess = Number(stats?.emailSuccessCount ?? 0);
    const emailFail = Number(stats?.emailFailCount ?? 0);
    const emailPending = Number(stats?.emailPendingCount ?? 0);
    const emailPie = [
        { name: 'Đã gửi', value: emailSuccess },
        { name: 'Lỗi ', value: emailFail },
        { name: 'Đang chờ', value: emailPending },
    ];

    // application (applies) stats for pie chart
    const approved = Number(stats?.approvedApplies ?? 0);
    const rejected = Number(stats?.rejectedApplies ?? 0);
    const pending = Number(stats?.pendingApplies ?? 0);
    const appliesPie = [
        { name: 'Đã duyệt', value: approved },
        { name: 'Bị từ chối', value: rejected },
        { name: 'Đang chờ', value: pending },
    ];

    // (no normalization required for now)
    // Alert recipients dialog state
    const [alertOpen, setAlertOpen] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);
    const [recipientsLoaded, setRecipientsLoaded] = useState(false);
    const [savingRecipients, setSavingRecipients] = useState(false);

    const loadRecipients = async () => {
        try {
            const res = await getAlertRecipients();
            const data = res?.data;
            const list = Array.isArray(data) ? data.map(item => item.email) : [];
            setEmails(list.length ? list : ['']);
            setRecipientsLoaded(true);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách email nhận thông báo');
            setEmails(['']);
            setRecipientsLoaded(true);
        }
    };


    const handleOpenChange = (open: boolean) => {
        setAlertOpen(open);
        if (open && !recipientsLoaded) {
            loadRecipients();
        }
    };

    const updateEmailAt = (idx: number, value: string) => {
        setEmails(prev => prev.map((e, i) => i === idx ? value : e));
    };

    const addEmailInput = () => setEmails(prev => [...prev, '']);
    const removeEmailInput = (idx: number) => setEmails(prev => prev.filter((_, i) => i !== idx));

    const saveRecipients = async () => {
        const cleaned = emails.map(e => e.trim()).filter(e => e.length);
        if (cleaned.length === 0) {
            toast.error('Vui lòng nhập ít nhất 1 email');
            return;
        }
        setSavingRecipients(true);
        try {
            await createAlertRecipients({ emails: cleaned });
            toast.success('Lưu danh sách email thành công');
            setAlertOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi lưu danh sách email');
        } finally {
            setSavingRecipients(false);
        }
    };

    const AnimatedNumber = ({ n }: { n: number }) => {
        const { number } = useSpring({
            from: { number: 0 },
            number: n,
            delay: 200,
            config: { mass: 1, tension: 20, friction: 10 },
        });

        return <animated.div>{number.to((val) => val.toFixed(0))}</animated.div>;
    };


    return (
        <div className="px-4 py-2">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Trang chủ</h2>
                <Button variant="login" size="sm" onClick={fetchAll}>Tải lại <i className="fa-solid fa-arrow-rotate-right"></i></Button>
            </div>

            <main className="space-y-6 py-2">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2 rounded-xl bg-white px-4 py-2 border shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800">Thống kê số lượng</h2>
                        {loading && !stats ? (
                            <div className="space-y-2">
                                <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-20 rounded-lg bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ) : stats ? (
                            <div>
                                <p className="text-xs text-slate-500 mb-4">Được thống kê vào lúc {new Date(stats.collectedAt ?? '').toLocaleString()}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {statTiles().map(tile => (
                                        <div key={tile.key} className="rounded-lg p-4 bg-white border shadow-sm">
                                            <div className="text-sm text-slate-600">{tile.label}</div>
                                            <div className="mt-2 text-2xl font-bold text-slate-900">
                                                <AnimatedNumber n={stats[tile.key] ?? 0} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-red-500">Không có dữ liệu thống kê</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-lg p-4 bg-white border shadow-sm">
                            <h3 className="text-sm font-medium mb-2 text-slate-800">Thống kê email</h3>
                            {(emailSuccess + emailFail + emailPending) > 0 ? (
                                <div style={{ width: '100%', height: 220 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={emailPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                                                <Cell fill="#ef4444" />
                                                <Cell fill="#b91c1c" />
                                                <Cell fill="#fecaca" />
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-600">Không có dữ liệu thống kê email</div>
                            )}
                        </div>

                        <div className="rounded-lg p-4 bg-white border shadow-sm">
                            <h3 className="text-sm font-medium mb-2 text-slate-800">Trạng thái đơn ứng tuyển</h3>
                            {(approved + rejected + pending) > 0 ? (
                                <div style={{ width: '100%', height: 220 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={appliesPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                                                <Cell fill="#ef4444" />
                                                <Cell fill="#b91c1c" />
                                                <Cell fill="#fecaca" />
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-600">Không có dữ liệu thống kê đơn ứng tuyển</div>
                            )}
                        </div>
                    </div>
                </section>

                <Separator />

                <section>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Chỉ số dịch vụ</h2>
                        <Dialog open={alertOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="login">Quản lý email cảnh báo</Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Danh sách email nhận cảnh báo</DialogTitle>
                                    <DialogDescription>Thêm hoặc sửa danh sách email sẽ nhận thông báo khi dịch vụ không hoạt động.</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3 mt-2">
                                    {!recipientsLoaded ? (
                                        <div className="text-sm text-slate-600">Đang tải...</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {emails.map((em, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <Input type="email" value={em} onChange={(e) => updateEmailAt(idx, e.target.value)} placeholder="Nhập email người dùng nhận cảnh báo" />
                                                    <Button variant="outline" size="sm" onClick={() => removeEmailInput(idx)}>Xóa</Button>
                                                </div>
                                            ))}

                                            <div>
                                                <Button variant="ghost" size="sm" onClick={addEmailInput}>Thêm email</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <div className="flex gap-2 ml-auto">
                                        <Button variant="outline" onClick={() => setAlertOpen(false)}>Hủy</Button>
                                        <Button onClick={saveRecipients} disabled={savingRecipients}>{savingRecipients ? 'Đang lưu...' : 'Lưu'}</Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {error && <div className="text-red-600 mb-2">{error}</div>}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        <div className="col-span-3 rounded-lg p-4 bg-white border shadow-sm">
                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {services.map(s => (
                                        <div key={s.serviceName} className="p-3 border rounded-md bg-white">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-slate-900">{s.serviceName}</div>
                                                <div>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'UP' ? 'bg-red-50 text-red-700' : 'bg-red-100 text-red-800'}`}>
                                                        {s.status === 'UP' ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-slate-700">CPU: <span className="font-semibold">{s.cpuUsage ?? '-'}</span>%</div>
                                            <div className="mt-1 text-sm text-slate-700">RAM: <span className="font-semibold">{s.memoryUsage ?? '-'}</span> MB</div>
                                            <div className="mt-2 h-2 bg-red-50 rounded-full overflow-hidden">
                                                <div style={{ width: `${Math.min(100, Number(s.cpuUsage ?? 0))}%` }} className="h-2 bg-red-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-600">Không có dữ liệu chỉ số dịch vụ để hiển thị.</div>
                            )}
                        </div>
                    </div>

                    {loading && services.length === 0 ? (
                        <div className="space-y-2">
                            <div className="h-8 w-1/2 bg-slate-200 rounded animate-pulse" />
                            <div className="h-48 bg-slate-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <div className="rounded-lg overflow-hidden border bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dịch vụ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>CPU (%)</TableHead>
                                        <TableHead>RAM (MB)</TableHead>
                                        <TableHead>Lần cuối gửi tín hiệu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map(s => (
                                        <TableRow key={s.serviceName}>
                                            <TableCell className='text-left'>
                                                <div className="font-medium text-slate-900">{s.serviceName}</div>
                                            </TableCell>
                                            <TableCell className='text-left'>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'UP' ? 'bg-red-50 text-red-700' : 'bg-red-100 text-red-800'}`}>
                                                    {s.status === 'UP' ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </TableCell>
                                            <TableCell className='text-left'>{s.cpuUsage ?? '-'}</TableCell>
                                            <TableCell className='text-left'>{s.memoryUsage ?? '-'}</TableCell>
                                            <TableCell className="text-left text-sm text-slate-600">{new Date(s.lastHeartbeat).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

