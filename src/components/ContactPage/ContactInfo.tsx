import React from 'react';
import InfoCard from './InfoCard';

interface ContactInfoProps {
    data: {
        office_location: string;
        phone: string;
        email: string;
    };
}

const ContactInfo = ({ data }: ContactInfoProps) => {
    return (
        <div className="flex flex-col flex-1 gap-8">
            <div>
                <h2 className="text-[#111418] text-[28px] font-bold leading-tight mb-2">Contact Information</h2>
                <p className="text-[#617589] text-base">Reaching out for a repair, new installation, or general inquiry? We're just a call away.</p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Phone Item 1 */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#f0f2f4] transition-transform hover:-translate-y-1 duration-300">
                    <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                        <span className="material-symbols-outlined">phone_in_talk</span>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <p className="text-[#111418] text-lg font-bold leading-normal">{data.phone || '+977-9801XXXXXX'}</p>
                        <p className="text-[#617589] text-sm font-normal">Sales Hotline (24/7)</p>
                    </div>
                    <a className="shrink-0 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors" href={`tel:${data.phone || '+9779801XXXXXX'}`}>Call</a>
                </div>

                {/* Phone Item 2 */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#f0f2f4] transition-transform hover:-translate-y-1 duration-300">
                    <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                        <span className="material-symbols-outlined">headset_mic</span>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <p className="text-[#111418] text-lg font-bold leading-normal">{data.phone || '+977-01-4XXXXXX'}</p>
                        <p className="text-[#617589] text-sm font-normal">Service Support &amp; Repairs</p>
                    </div>
                    <a className="shrink-0 text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors" href={`tel:${data.phone || '+977014XXXXXX'}`}>Call</a>
                </div>

                {/* WhatsApp CTA */}
                <div className="flex items-center gap-4 bg-[#25D366]/10 p-4 rounded-xl border border-[#25D366]/20 transition-transform hover:-translate-y-1 duration-300 group cursor-pointer">
                    <div className="text-[#25D366] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                        <span className="material-symbols-outlined">chat</span>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <p className="text-[#111418] text-lg font-bold leading-normal group-hover:text-[#25D366] transition-colors">Chat on WhatsApp</p>
                        <p className="text-[#617589] text-sm font-normal">Get instant quotes &amp; support</p>
                    </div>
                    <span className="material-symbols-outlined text-[#25D366]">arrow_forward</span>
                </div>

                {/* Location & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-white p-4 rounded-xl border border-[#f0f2f4]">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            <h3 className="font-bold text-[#111418]">Head Office</h3>
                        </div>
                        <p className="text-sm text-[#617589] pl-9">
                            {data.office_location || 'New Baneshwor, Kathmandu\nNepal (Opposite to Eyeplex Mall)'}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#f0f2f4]">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">schedule</span>
                            <h3 className="font-bold text-[#111418]">Opening Hours</h3>
                        </div>
                        <p className="text-sm text-[#617589] pl-9">
                            Sun - Fri: 9:00 AM - 6:00 PM<br/>
                            Saturday: Closed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
