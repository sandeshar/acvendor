import type { TermsHeaderData, TermsSectionData } from '@/types/pages';
import type { ReactNode } from 'react';

async function getTermsData() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const [headerRes, sectionsRes] = await Promise.all([
            fetch(`${baseUrl}/api/pages/terms/header`, { next: { tags: ['terms-header'] } }),
            fetch(`${baseUrl}/api/pages/terms/sections`, { next: { tags: ['terms-sections'] } })
        ]);

        const headerData = await headerRes.json();
        const sectionsData = await sectionsRes.json();

        return {
            header: headerData,
            sections: sectionsData
        };
    } catch (error) {
        console.error('Error fetching terms page data:', error);
        return {
            header: null,
            sections: []
        };
    }
}

export default async function TermsPage() {
    const data = await getTermsData();
    const { header, sections } = data;

    // Render section content with smart link/email detection when toggles are enabled
    function renderSectionContent(section: TermsSectionData) {
        const content = section.content || '';

        // Regex matches URLs or emails
        const regex = /(https?:\/\/[^\s]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
        const nodes: Array<string | ReactNode> = [];
        let lastIndex = 0;
        let m: RegExpExecArray | null;

        while ((m = regex.exec(content)) !== null) {
            const idx = m.index;
            if (idx > lastIndex) nodes.push(content.substring(lastIndex, idx));
            const matchText = m[0];
            if (matchText.includes('@')) {
                nodes.push(
                    <a key={idx} href={`mailto:${matchText}`} className="text-primary underline">
                        {matchText}
                    </a>
                );
            } else {
                nodes.push(
                    <a key={idx} href={matchText} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                        {matchText}
                    </a>
                );
            }
            lastIndex = idx + matchText.length;
        }

        if (lastIndex < content.length) nodes.push(content.substring(lastIndex));



        // Return assembled nodes
        return <>{nodes.map((n, i) => (typeof n === 'string' ? <span key={i}>{n}</span> : <span key={i}>{n}</span>))}</>;
    }

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full max-w-7xl py-12 md:py-16 px-4 md:px-0">
                <div className="flex flex-col items-center text-center gap-4 mb-8 md:mb-12">
                    {header ? (
                        <>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                {header.title}
                            </h1>
                            <p className="mt-2 text-sm md:text-lg text-slate-600">
                                {header.last_updated}
                            </p>
                        </>
                    ) : (
                        <div className="mx-auto animate-pulse space-y-3">
                            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
                            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                        </div>
                    )}
                </div>

                <div className="prose prose-slate mx-auto mt-8 md:mt-12 max-w-3xl prose-headings:font-semibold prose-headings:text-slate-800 prose-p:text-slate-700 prose-a:text-primary hover:prose-a:underline space-y-8">
                    {sections && sections.length > 0 ? (
                        sections.map((section: TermsSectionData) => (
                            <section key={section.id} className="py-6 md:py-8">
                                <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
                                <p className="text-base md:text-lg leading-relaxed">
                                    {renderSectionContent(section)}
                                </p>
                            </section>
                        ))
                    ) : (
                        <div className="space-y-6">
                            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                            <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
