type AppProps = {
    path: string;
};

export function App({ path }: AppProps) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Soku-p
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Privacy-First Image Converter
                    </p>
                    <div className="mt-8 p-8 rounded-2xl bg-card border border-border shadow-lg">
                        <p className="text-foreground">
                            🚀 Hello World! Server-Side Rendering is working.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Current path: <code className="bg-muted px-2 py-1 rounded">{path}</code>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
