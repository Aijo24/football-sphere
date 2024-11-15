/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['*'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(png|jpg|gif|svg|webp)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                },
            ],
        });
        return config;
    },
}

module.exports = nextConfig
