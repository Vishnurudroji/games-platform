import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) => (
    <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);
