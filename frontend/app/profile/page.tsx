
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, LogOut, ShoppingBag } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    if (isLoading || !isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAF3EA] px-4 py-16">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Profile
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Manage your HomeNest account.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8">

                    {/* User Avatar */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-24 h-24 rounded-full bg-[#FAF3EA] flex items-center justify-center">
                            <User size={42} className="text-[#B88E2F]" />
                        </div>

                        <h2 className="mt-4 text-2xl font-bold text-gray-800">
                            {user.username}
                        </h2>

                        <span className="mt-2 text-sm text-green-600 bg-green-50 px-4 py-1 rounded-full">
                            Active Account
                        </span>
                    </div>

                    {/* User Information */}
                    <div className="space-y-5">

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                            <User className="text-[#B88E2F]" size={22} />

                            <div>
                                <p className="text-sm text-gray-500">
                                    Username
                                </p>
                                <p className="font-semibold text-gray-800">
                                    {user.username}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                            <Mail className="text-[#B88E2F]" size={22} />

                            <div>
                                <p className="text-sm text-gray-500">
                                    Email Address
                                </p>
                                <p className="font-semibold text-gray-800">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-10">

                        <Link
                            href="/shop"
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#B88E2F] text-[#B88E2F] py-3 font-semibold hover:bg-[#FAF3EA] transition"
                        >
                            <ShoppingBag size={20} />
                            Continue Shopping
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500 text-white py-3 font-semibold hover:bg-red-600 transition"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </main>
    );
}
