import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports/monthly');
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching reports', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0266a2]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Monthly Material Requests</h1>
                <p className="text-slate-500 mt-1">Request trends throughout the year</p>
            </div>

            {/* Chart Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            barSize={40}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 13 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 13 }}
                                dx={-10}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar 
                                dataKey="requests" 
                                fill="#0266a2" 
                                radius={[4, 4, 0, 0]} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Panel placeholder (Requests by Category) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-4">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Requests by Category</h2>
                    <p className="text-sm text-slate-500 mt-1">Breakdown of material requests by category</p>
                </div>
                <div className="overflow-x-auto flex-1 p-6">
                    <p className="text-slate-500 text-center py-4">Data category will be displayed here.</p>
                </div>
            </div>

        </div>
    );
};

export default Reports;
