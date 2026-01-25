import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Dynamic params
        const title = searchParams.get('title') || 'My Portfolio';
        const description = searchParams.get('description') || 'Senior Full Stack Engineer';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a', // slate-900
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #334155 2%, transparent 0%), radial-gradient(circle at 75px 75px, #334155 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        color: 'white',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            border: '2px solid #3b82f6', // blue-500
                            borderRadius: '20px',
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: 60,
                                fontWeight: 900,
                                background: 'linear-gradient(to right, #60a5fa, #a855f7)', // blue-400 to purple-500
                                backgroundClip: 'text',
                                color: 'transparent',
                                marginBottom: 20,
                                textAlign: 'center',
                            }}
                        >
                            {title}
                        </h1>
                        <p
                            style={{
                                fontSize: 30,
                                color: '#94a3b8', // slate-400
                                textAlign: 'center',
                                maxWidth: '800px',
                            }}
                        >
                            {description}
                        </p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
