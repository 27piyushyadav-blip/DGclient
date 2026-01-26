import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.APP_URL || 'https://mindnamo.com';
  
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',             // Block API routes
          '/profile/',         // Private user settings
          '/appointments/',    // Private dashboard
          '/chat/',            // Private messages
          '/video-call/',      // Secure sessions
          '/checkout/',        // Transaction pages
          '/booking-success/', // Transaction pages
          '/otp/',             // Auth flow
          '/reset-password/',  // Auth flow
        ],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }
