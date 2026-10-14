import * as React from 'react';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import '../resources.css';
export function ResourcesShell({ children }: { children: React.ReactNode }) { return <div className="resources-shell"><Header /><main>{children}</main><Footer /></div>; }
