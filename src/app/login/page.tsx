'use client';

import { useState } from "react";
import { showToast } from '@/components/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginHandler = async () => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            window.location.href = '/admin';
        } else {
            const data = await response.json();
            showToast(data.message || 'Login failed', { type: 'error' });
        }
    }
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light group/design-root overflow-x-hidden p-4">
            <form className="flex w-full max-w-md flex-col items-center space-y-8 rounded-xl bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-symbols-outlined text-primary text-3xl"> admin_panel_settings </span>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-800">Admin Panel Login</h1>
                </div>
                <div className="w-full text-center">
                    <h1 className="text-slate-900 tracking-light text-[32px] font-bold leading-tight">Secure Sign In</h1>
                    <p className="mt-2 text-sm text-slate-600">Enter your credentials to access the dashboard.</p>
                </div>
                <div className="w-full space-y-6">
                    <label className="flex flex-col">
                        <p className="text-slate-800 text-base font-medium leading-normal pb-2">Email</p>
                        <input name="email" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-background-light focus:border-primary h-14 placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>
                    <div className="flex flex-col">
                        <div className="flex w-full items-center justify-between pb-2">
                            <p className="text-slate-800 text-base font-medium leading-normal">Password</p>
                        </div>
                        <div className="relative flex w-full flex-1 items-stretch">
                            <input name="password" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-background-light focus:border-primary h-14 placeholder:text-slate-400 p-[15px] pr-12 text-base font-normal leading-normal" placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                </div>
                <button onClick={loginHandler} type="button" className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;