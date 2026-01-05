
import React from 'react';
import Link from 'next/link';

interface Project {
    _id?: string;
    id?: number;
    title: string;
    category: string;
    location: string;
    image: string;
}

interface ProjectGalleryProps {
    projects: Project[];
    section?: {
        title?: string;
        description?: string;
    } | null;
}

const ProjectGallery = ({ projects, section }: ProjectGalleryProps) => {
    const defaultProjects = [
        {
            title: "Corporate Tower, Kathmandu",
            description: "Centralized VRF Installation",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyhWyXXVozxY5GzsrCQwyqq4kSGGfTOK2QqtZ1ps4gyjfytabYzZ7jQQGGva8qtQk2lCwuEvwd_ALpYWJHSeE_4twKoGXF7yQy_iJzXptGkWV4c7Y7-TIE0ZigUgHiRLf1OZePm1oL2ObgtL1QiY8rwxSjbe525vHacYHgNziemtsJoIQtXKPOTD74qHXwk7_4OzcVBxGpW0E0cDCTHnQzwFqa_TG5Pd1SMu9ZksxP6OcWgcmpuPCwTfZCNNICs0p4QSCorrc-SZ0",
            className: "md:col-span-2 md:row-span-2"
        },
        {
            title: "Private Residence, Lalitpur",
            description: "Multi-Split System",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzszNvxzs8mmSf7b_rvuRHp9ocZDPDpetUuytsKDg10rxBjR42PF-YvhBXTPEXq3pUXsuCW6QtJsgcXVuxIiotdWuLh5SUJ1nraEnel6GZ2TqBsCENUo08_ZyrCh1Fu4pq27ozMBj9Plp6BFay7bEuKpV9n3uKi1pTVIggz5H96IT_exZuEerFysWOMv6YtglW0Nfq4jxG8PwDhj-Uh2QdphW8cPJK5egiLcAUPLsWV4NvNyW5qfl-OppUhEi7zV4oqm0p0uy6x_I",
            className: ""
        },
        {
            title: "Hotel Summit, Pokhara",
            description: "Room AC Upgrade",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXsttdfzvwYWYzwVQoWt_69yZ20hLWqcEFalx6vXaxoVCYyfz65arXjiSgqZ8wNbbtXF2h-3NgDIBHVO7qV1_oLDBzTexHDME2whB0w2Cfa9FvVqJpZoxFYskk3u9hzh4mCCTXZivq_uQcavD-J2R5H1-epV-Zsg89wsdxusPqPwT2fotv-i6Z9HR2RmbUHj20u_dKnnhwa3vPApRpyJSz3xJghmloA0Sdy_zJ4XxkyaO9QczDqK7LVscM3unJFDM8oHiJ71MgJ4s",
            className: ""
        }
    ];

    // Use provided projects or fallback to defaults if none provided
    const displayProjects = projects && projects.length > 0 ? projects.slice(0, 3).map((p, i) => ({
        title: p.title,
        description: p.category,
        image: p.image,
        className: i === 0 ? "md:col-span-2 md:row-span-2" : ""
    })) : defaultProjects;

    return (
        <div className="w-full bg-background-light py-20" id="projects">
            <div className="layout-container flex justify-center px-4 md:px-10">
                <div className="flex flex-col w-full max-w-7xl gap-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-4 max-w-2xl">
                            <h2 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight">
                                {section?.title || 'Featured Projects'}
                            </h2>
                            <p className="text-[#617589] text-lg">
                                {section?.description || 'Delivering comfort to homes, hotels, and corporate offices across Nepal.'}
                            </p>
                        </div>
                        <Link
                            href="/projects"
                            className="flex h-12 items-center justify-center rounded-xl bg-[#f0f2f4] px-6 text-[#111418] text-base font-bold leading-normal transition-colors hover:bg-[#e2e5e9] shrink-0"
                        >
                            View All Projects
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
                        {displayProjects.map((project, index) => (
                            <div key={index} className={`relative group overflow-hidden rounded-xl ${project.className}`}>
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url("${project.image}")` }}
                                ></div>
                                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-white font-bold text-xl">{project.title}</h3>
                                    <p className="text-white/80 text-sm">{project.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectGallery;

