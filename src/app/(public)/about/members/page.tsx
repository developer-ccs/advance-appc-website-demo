import React from "react";

const membersData = [
  {
    id: 1,
    name: "Mr. John Doe, IAS",
    primaryRole: "Administrator",
    secondaryRole: "Commissioner - Food Safety and Drug Administration",
    imageUrl: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Dr. Jane Smith",
    primaryRole: "Registrar",
    secondaryRole: ".",
    imageUrl: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    primaryRole: "Vice President",
    secondaryRole: "Head of Pharmacy Council",
    imageUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    name: "Mr. Robert Patel",
    primaryRole: "Executive Member",
    secondaryRole: "State Health Department Liaison",
    imageUrl: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 5,
    name: "Dr. Sarah Johnson",
    primaryRole: "Advisory Board",
    secondaryRole: "Senior Pharmacologist",
    imageUrl: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: 6,
    name: "Mr. David Kim",
    primaryRole: "Treasurer",
    secondaryRole: "Finance & Audit Committee",
    imageUrl: "https://i.pravatar.cc/150?img=59",
  },
];

export default function CouncilMembers() {
  return (
    <section className="min-h-screen bg-linear-to-b from-[#e3e8f0] to-[#f0f4f8] font-sans pb-16">
      {/* HEADER SECTION */}
      <div
        className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden shadow-md"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1e293b]/85 mix-blend-multiply"></div>
        <h1 className="text-white text-2xl md:text-4xl font-semibold tracking-wider z-10 flex items-center gap-4 drop-shadow-md text-center px-4">
          <span className="hidden md:block w-8 md:w-12 h-0.5 bg-[#e74c3c]"></span>
          COUNCIL MEMBERS
          <span className="hidden md:block w-8 md:w-12 h-0.5 bg-[#e74c3c]"></span>
        </h1>
      </div>

      {/* 
        CARDS CONTAINER
        Using 'flex', 'flex-wrap', and 'justify-center' guarantees that the boxes are 
        ALWAYS centered on mobile, tablet, and desktop.
      */}
      <div className="max-w-7xl mx-auto px-4 mt-12 flex flex-wrap justify-center gap-8">
        {membersData.map((member) => (
          <div
            key={member.id}
            // w-full max-w-[280px] ensures it never stretches wider than 280px on mobile
            className="bg-white w-full max-w-70 p-6 rounded shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300"
          >
            {/* Image Wrapper */}
            <div className="w-32.5 h-32.5 shrink-0 bg-white p-1 rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.25)] mb-5">
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-sm"
              />
            </div>

            {/* Member Details */}
            <h3 className="text-[#0b5c3b] text-[15px] font-semibold mb-1">
              {member.name}
            </h3>

            <p className="text-[#172b53] text-[14px] mb-4">
              {member.primaryRole}
            </p>

            {/* Divider */}
            <div className="w-[90%] border-t border-gray-200 mt-auto mb-3"></div>

            <p className="text-black italic font-medium text-[13px] leading-relaxed px-2">
              {member.secondaryRole}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
