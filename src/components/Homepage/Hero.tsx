import CTAButton from '../shared/CTAButton';
import StarIcon from '../shared/StarIcon';

interface HeroData {
    id: number;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    hero_image_alt?: string;
    badge_text?: string;
    highlight_text?: string;
    colored_word?: string;
    float_top_enabled?: number;
    float_top_icon?: string;
    float_top_title?: string;
    float_top_value?: string;
    float_bottom_enabled?: number;
    float_bottom_icon?: string;
    float_bottom_title?: string;
    float_bottom_value?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    rating_text?: string;
    is_active: number;
    updatedAt: Date;
}

interface HeroProps {
    data?: HeroData | null;
}

const AvatarList = () => (
    <div className="flex -space-x-3" aria-hidden>
        <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSpy53nmHtxtTkompr0U5wlwZWFYZJDNk7GjA9-O4iOv-ZHJVFbDnl-mqCCH9pSUgCt9XZ9XehLTovbWeKhFYgRTXQsEQRSGPj9AJR1_Wqf5gpDjXJPIuVRgTF-IBr80s6VWteFE7PKAWIWi5hohaN1scKGzMdIMR3VrStzut8iDvo2xhclYGoZ1l4BsjTjNoyI6tL7bt5H2xndCMAGbAqMwM67RMjOTnPCXweriKLSl2B-DzCe2o3OovgtBIGjNyNKNUHk5NKD0c" />
        <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8lNGQE5AKH2jT1ixjd-ecIaNsPRHmBRqHXINCkZDvh8OETJRHbo7SLVoP6tgDx2H4kIUob2tbjbwp46kUFvPbY3znIBSfrg69LxtPAV4LTTXY4TrynMnDRFNASV6ZfUnV8hh6vLDS8uvMhEDB32QvXRkZae_jT0vFGiSm38YisYluh3YIMtR2WFFGzu2juHXagKk4Z-LZGYEFL-kKix5yajEMp1vCJuwcekVhj12MBPSTUdz9eq6YUylBsza99eBeGkNY1rje6go" />
        <img alt="User" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkWe0Z-JjmmalmerCPJhKs-S5DcjpJbQ9cmhlotohozR3NZcFr9FUkWlccHJ8bQkbuzctReniOawWvgwBLRGR7Q-ek5wHeOPwHId1pE2QfeBAGVkyOrUb9h9CkFcjiJ1GRjgSasbwJ91W8FnFyFjs3Sd-kP0PCrXS0fdzJi8-Q3IRfsz8DiRi16ShJtqty0brtTGfvN6OJOryQ9xPTkoXiJM0oXodu2OLe4glzX1K0cG2sYYoSzqBs12KRaJtANov31VSwmevZ-yU" />
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-muted bg-card text-xs font-bold text-subtext">
            +2k
        </div>
    </div>
);

const HighlightedTitle = ({ title, highlight, coloredWord }: { title: string; highlight?: string; coloredWord?: string }) => {
    // Render title line-by-line and color the `coloredWord` if provided, otherwise the `highlight` substring.
    // If neither is provided or not found in the line, fall back to coloring the last word (preserves previous behavior).
    const colorCandidate = (coloredWord || highlight || '').trim();
    return (
        <>
            {title.split('\n').map((line, i) => {
                const wordToColor = (coloredWord || highlight || '').trim();
                if (wordToColor) {
                    const idx = line.indexOf(wordToColor);
                    if (idx !== -1) {
                        return (
                            <span key={i} className="block">
                                {line.substring(0, idx)}
                                <span className="relative whitespace-nowrap">
                                    <span className="relative z-10 bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-600 to-indigo-600">{wordToColor}</span>
                                </span>
                                {line.substring(idx + wordToColor.length)}
                            </span>
                        );
                    }
                }

                // Default: color the last word of the line (keeps prior two-color behavior)
                const trimmed = line.trim();
                const parts = trimmed.split(' ');
                if (parts.length === 1) return <span key={i} className="block">{trimmed}</span>;
                const last = parts.pop();
                const first = parts.join(' ');
                return (
                    <span key={i} className="block">
                        {first} <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-600 to-indigo-600">{last}</span>
                    </span>
                );
            })}
        </>
    );
};

const Hero = ({ data }: HeroProps) => {
    if (!data) return null;

    return (
        <section className="relative w-full min-h-[calc(100vh-60px)] flex items-center overflow-hidden">
            <div className="relative max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 xl:gap-32 items-center justify-items-center lg:justify-items-stretch">
                    <div className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left z-10">
                        {data.badge_text && (
                            <div className="flex justify-center lg:justify-start">
                                <div className="inline-flex items-center gap-2 rounded-full border border-muted bg-card px-3 py-1 backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-subtext">{data.badge_text}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            <h1 className="text-body text-3xl font-black leading-[1.05] tracking-[-0.033em] md:text-4xl lg:text-5xl xl:text-6xl">
                                <HighlightedTitle title={data.title} highlight={data.highlight_text} coloredWord={data.colored_word} />
                            </h1>
                            <p className="text-subtext text-sm font-normal leading-relaxed md:text-base xl:text-lg max-w-2xl mx-auto lg:mx-0">{data.subtitle}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a href={data.cta_link || '#'} aria-label={data.cta_text}>
                                <CTAButton text={data.cta_text || 'Contact'} variant="primary" className="rounded-xl h-10 md:h-12 px-4 md:px-6 xl:h-14 xl:px-8 shadow-lg shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300" />
                            </a>
                            {data.secondary_cta_text && (
                                <a href={data.secondary_cta_link || '#'} aria-label={data.secondary_cta_text}>
                                    <CTAButton text={data.secondary_cta_text} variant="secondary" className="rounded-xl h-10 md:h-12 px-4 md:px-6 xl:h-14 xl:px-8" />
                                </a>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4 border-t border-muted mt-2">
                            <AvatarList />
                            <div className="flex flex-col items-center sm:items-start gap-1">
                                <div className="flex text-yellow-400" aria-hidden>
                                    <StarIcon className="h-4 w-4" />
                                    <StarIcon className="h-4 w-4" />
                                    <StarIcon className="h-4 w-4" />
                                    <StarIcon className="h-4 w-4" />
                                    <StarIcon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-600">{data.rating_text || 'Trusted by modern teams'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full z-10 perspective-1000">
                        <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[560px] xl:h-[72vh] rounded-2xl shadow-2xl bg-card border-4 border-muted overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 group" style={{ backgroundImage: `url("${data.background_image}")`, backgroundPosition: 'center', backgroundSize: 'cover' }} role="img" aria-label={data.hero_image_alt || 'Hero image'}>
                            {data.float_top_enabled !== 0 && (
                                <div className="absolute top-5 right-2 sm:right-8 bg-card p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hidden sm:flex items-center gap-3 animate-float z-20">
                                    <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center text-primary-var">
                                        <span className="material-symbols-outlined">{data.float_top_icon || 'trending_up'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-subtext font-bold uppercase tracking-wider">{data.float_top_title || 'Growth'}</p>
                                        <p className="text-sm font-bold text-body">{data.float_top_value || '+240% ROI'}</p>
                                    </div>
                                </div>
                            )}

                            {data.float_bottom_enabled !== 0 && (
                                <div className="absolute bottom-5 left-2 sm:left-8 bg-card p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hidden sm:flex items-center gap-3 animate-float-delayed z-20">
                                    <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center text-primary-var">
                                        <span className="material-symbols-outlined">{data.float_bottom_icon || 'check_circle'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-subtext font-bold uppercase tracking-wider">{data.float_bottom_title || 'Ranking'}</p>
                                        <p className="text-sm font-bold text-body">{data.float_bottom_value || '#1 Result'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;