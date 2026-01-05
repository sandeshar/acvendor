'use client';

import { useState } from 'react';

interface Project {
    id: number;
    title: string;
    category: string;
    location: string;
    capacity: string;
    system: string;
    image: string;
    image_alt: string | null;
}

interface ProjectsClientProps {
    projects: Project[];
}

const ProjectsClient = ({ projects }: ProjectsClientProps) => {
    const [selectedCategory, setSelectedCategory] = useState('All Projects');

    const categories = ['All Projects', 'Residential', 'Commercial', 'Industrial', 'Hospitality'];

    const filteredProjects = selectedCategory === 'All Projects'
        ? projects
        : projects.filter(p => p.category === selectedCategory);

    return (
        <div className="flex flex-col gap-10">
            {/* Filter Chips */}
            <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-gray-200 md:border-none md:bg-transparent">
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-6 transition-all ${selectedCategory === cat
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white border border-gray-200 hover:border-gray-300 text-[#111418] hover:shadow-md'
                                }`}
                        >
                            <p className="text-sm font-bold leading-normal">{cat}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                    >
                        <div className="relative overflow-hidden aspect-4/3">
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-700"
                                style={{ backgroundImage: `url("${project.image}")` }}
                            >
                            </div>
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                <p className="text-xs font-bold text-primary uppercase tracking-wide">{project.category}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 p-5 flex-1">
                            <div>
                                <h3 className="text-[#111418] text-xl font-bold leading-tight mb-1">{project.title}</h3>
                                <div className="flex items-center gap-1 text-[#617589] text-sm">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{project.location}</span>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 w-full"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity</span>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-[#111418]">
                                        <span className="material-symbols-outlined text-primary text-[18px]">ac_unit</span>
                                        {project.capacity}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</span>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-[#111418]">
                                        <span className="material-symbols-outlined text-primary text-[18px]">settings</span>
                                        {project.system}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                    <p className="text-lg">No projects found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectsClient;
