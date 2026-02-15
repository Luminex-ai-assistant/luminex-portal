import React from 'react';

interface PageProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-none',
};

export function Page({
  title,
  description,
  actions,
  children,
  maxWidth = 'xl',
  className = '',
}: PageProps) {
  return (
    <div className={`min-h-full bg-slate-950 ${className}`}>
      {/* Page Header */}
      {(title || description || actions) && (
        <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-base text-slate-400 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8`}>
        {children}
      </div>
    </div>
  );
}

// Page section component for consistent spacing
interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  children,
  className = '',
}: PageSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
