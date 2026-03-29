import type { Link } from '../types';

export const mockLinks: Link[] = [
  {
    id: "1",
    title: "Apple Human Interface Guidelines",
    description: "In-depth information and UI resources for designing great apps that integrate seamlessly with Apple platforms.",
    image: "https://developer.apple.com/design/human-interface-guidelines/images/intro/hero_2x.png",
    url: "https://developer.apple.com/design/human-interface-guidelines/",
    category: "Design Systems",
    tags: ["apple", "design", "system"],
    featured: true,
    modifiedAt: "2 hours ago"
  },
  {
    id: "2",
    title: "Material Design 3",
    description: "Material 3 is the latest version of Google’s open-source design system.",
    image: "https://lh3.googleusercontent.com/rN9gB7e2pUj2U_F7bM-k2Cg-ZItT3LzXZ68M_bN6n6sM_vQ_n3QzF5Ew-G_7jE4X3zL3F-Z5sU=w1024",
    url: "https://m3.material.io/",
    category: "Design Systems",
    tags: ["google", "material", "design"],
    featured: false,
    modifiedAt: "1 day ago"
  },
  {
    id: "3",
    title: "shadcn/ui",
    description: "Beautifully designed components that you can copy and paste into your apps.",
    image: "https://ui.shadcn.com/og.jpg",
    url: "https://ui.shadcn.com/",
    category: "Component Libraries",
    tags: ["react", "tailwind", "components"],
    featured: true,
    modifiedAt: "4 days ago"
  },
  {
    id: "4",
    title: "Next.js 14",
    description: "The React Framework for the Web. Used by some of the world's largest companies.",
    image: "https://nextjs.org/api/docs-og?title=Next.js%2014",
    url: "https://nextjs.org",
    category: "Web Frameworks",
    tags: ["react", "framework", "ssr"],
    featured: true,
    modifiedAt: "Last week"
  },
  {
    id: "5",
    title: "Vite",
    description: "Next Generation Frontend Tooling. Get ready for a development environment that can finally catch up with you.",
    image: "https://vitejs.dev/og-image.webp",
    url: "https://vitejs.dev/",
    category: "Web Frameworks",
    tags: ["tooling", "build", "fast"],
    featured: false,
    modifiedAt: "2 weeks ago"
  }
];
