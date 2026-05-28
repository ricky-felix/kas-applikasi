import type { Metadata } from "next";
import { Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { getSession } from "@/lib/session";
import "./globals.css";

const newsreader = Newsreader({
	variable: "--font-newsreader",
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "500"],
});

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains",
	subsets: ["latin"],
	weight: ["400", "500"],
});

export const metadata: Metadata = {
	title: "Tauke — CV KAS Companion App",
	description: "Internal field contractor management app",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();

	return (
		<html
			lang="id"
			className={`${newsreader.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full`}
			style={{
				fontFamily:
					"var(--font-manrope), Helvetica Neue, system-ui, sans-serif",
			}}
		>
			<PostHogProvider>
				<body className="min-h-full">
					<Suspense fallback={null}>
						<PostHogPageView />
					</Suspense>
					{session && <PostHogIdentify user={session} />}
					{children}
				</body>
			</PostHogProvider>
		</html>
	);
}
