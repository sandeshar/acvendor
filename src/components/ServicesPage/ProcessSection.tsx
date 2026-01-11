import ProcessStep from './ProcessStep';
import { stripHtml } from '@/utils/stripHtml';

interface ProcessSectionData {
    id: number;
    title: string;
    description: string;
    is_active: number;
    updatedAt: Date;
}

interface ProcessStepData {
    id: number;
    step_number: number;
    title: string;
    description: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ProcessSectionProps {
    section?: ProcessSectionData | null;
    steps?: ProcessStepData[];
}

const ProcessSection = ({ section, steps = [] }: ProcessSectionProps) => {
    if (!section) {
        return null;
    }

    return (
        <section className="px-4 md:px-10 py-20 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {section.title}
                    </h2>
                    <p className="max-w-3xl text-base text-slate-600 sm:text-lg">
                        {stripHtml(section.description || '')}
                    </p>
                </div>
                <div className="relative mt-12">
                    <div className="absolute top-1/2 -mt-px hidden w-full border-t-2 border-dashed border-slate-300 lg:block" />
                    <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step) => (
                            <ProcessStep
                                key={step.id}
                                number={step.step_number}
                                title={step.title}
                                description={step.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
