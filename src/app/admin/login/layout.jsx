export const metadata = {
    title: 'Admin Login | Portfolio',
    description: 'Secure access to portfolio management',
};

export default function LoginLayout({ children }) {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md w-full animate-fade-in">
                {children}
            </div>
        </div>
    );
}
