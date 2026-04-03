"use client";

import { useState } from "react";
import type { SVGProps, ReactNode } from "react";
import { getShadowColor } from "@/lib/utils";

type MemberProfileShape = {
  name?: string | null;
  avatar_url?: string | null;
  job_title?: string | null;
  location?: string | null;
  bio?: string | null;
};

type MemberCardMember = {
  id: string;
  role?: string | null;
  member_profiles?: MemberProfileShape | null;
};

const avatars = [
  // SVG 1: Iced Frappuccino
  (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="100" height="100" fill="#F3F0E6" />
      <path d="M48 20 L52 20 L52 35 L48 35 Z" fill="#2E7D32" />
      <path d="M30 35 Q 50 20 70 35 Z" fill="#FAFAFA" />
      <path d="M35 35 L65 35 L60 85 L40 85 Z" fill="#D7CCC8" />
      <path d="M35 45 L65 45 L62 70 L38 70 Z" fill="#8D6E63" />
      <circle cx="50" cy="55" r="8" fill="#1B5E20" />
    </svg>
  ),
  // SVG 2: Hot Coffee Cup
  (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="100" height="100" fill="#E8F5E9" />
      <path d="M35 30 L65 30 L60 80 L40 80 Z" fill="#FFFFFF" />
      <path d="M33 30 L67 30 L67 34 L33 34 Z" fill="#FFFFFF" />
      <path d="M37 50 L63 50 L61 65 L39 65 Z" fill="#A1887F" />
      <circle cx="50" cy="57" r="5" fill="#2E7D32" />
      <path d="M45 25 Q 40 15 50 10" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M55 25 Q 60 15 50 5" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  // SVG 3: Latte Art
  (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="100" height="100" fill="#FFF3E0" />
      <circle cx="50" cy="50" r="35" fill="#FAFAFA" />
      <circle cx="50" cy="50" r="25" fill="#D7CCC8" />
      <circle cx="50" cy="50" r="22" fill="#8D6E63" />
      <path d="M50 35 Q 60 50 50 65 Q 40 50 50 35 Z" fill="#FFF8E1" opacity="0.8" />
      <circle cx="50" cy="50" r="2" fill="#FFF8E1" opacity="0.8" />
    </svg>
  ),
  // SVG 4: Iced Matcha
  (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="100" height="100" fill="#F1F8E9" />
      <path d="M48 20 L52 20 L52 30 L48 30 Z" fill="#2E7D32" />
      <path d="M35 30 L65 30 L60 80 L40 80 Z" fill="#FFFFFF" opacity="0.5" />
      <path d="M37 40 L63 40 L61 78 L39 78 Z" fill="#AED581" />
      <path d="M38 35 L62 35 L63 40 L37 40 Z" fill="#FAFAFA" opacity="0.8" />
      <rect x="42" y="45" width="6" height="6" fill="#FAFAFA" opacity="0.6" rx="1" />
      <rect x="52" y="55" width="5" height="5" fill="#FAFAFA" opacity="0.6" rx="1" />
      <circle cx="50" cy="55" r="6" fill="#2E7D32" opacity="0.9" />
    </svg>
  ),
];

export function MemberCard({ 
  member, 
  children,
  labels,
}: { 
  member: MemberCardMember;
  children?: ReactNode;
  labels?: {
    anonymous?: string;
    close?: string;
    roleLocation?: string;
    noRole?: string;
    noLocation?: string;
    about?: string;
    noBio?: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use member ID to predictably choose an avatar 0-3
  const hash = String(member.id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarIndex = hash % avatars.length;
  const Avatar = avatars[avatarIndex];
  const photoUrl = member.member_profiles?.avatar_url;

  return (
    <>
      <article 
        onClick={() => setIsOpen(true)}
        className="group cursor-pointer rounded-3xl bg-white aspect-square overflow-hidden shadow-[0_20px_50px_rgba(84,54,35,0.08)] transition-all hover:scale-[1.02] hover:shadow-xl relative"
      >
        {photoUrl ? (
          <img src={photoUrl} alt={member.member_profiles?.name ?? "Avatar"} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
        ) : (
          <Avatar className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Name Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-5">
          <h2 className="font-display text-xl md:text-2xl font-bold text-white drop-shadow-sm leading-tight">
            {member.member_profiles?.name ?? "Anonymous"}
          </h2>
        </div>
      </article>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="surface-card w-full max-w-md rounded-[2.5rem] p-6 md:p-8 relative animate-in fade-in zoom-in-95 duration-200"
            style={{ '--shadow-color': getShadowColor(member.id) } as any}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label={labels?.close ?? "Close modal"}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-5 border-4 border-white shadow-md">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Avatar className="w-full h-full object-cover" />
              )}
            </div>
            <h2 className="font-display text-3xl text-center text-stone-900 mb-2">
              {member.member_profiles?.name ?? labels?.anonymous ?? "Anonymous"}
            </h2>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-xs font-semibold text-stone-600 tracking-wide uppercase">
                {member.role}
              </span>
            </div>
            
            <div className="space-y-5 bg-stone-50 rounded-2xl p-5 mb-6">
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  {labels?.roleLocation ?? "Role & Location"}
                </h3>
                <p className="text-stone-800 text-sm font-medium">
                  {member.member_profiles?.job_title ?? labels?.noRole ?? "No role added yet"} ·{" "}
                  {member.member_profiles?.location ?? labels?.noLocation ?? "No location"}
                </p>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  {labels?.about ?? "About"}
                </h3>
                <p className="text-stone-700 leading-relaxed text-sm">
                  {member.member_profiles?.bio || labels?.noBio || "No biography available."}
                </p>
              </div>
            </div>

            {/* Actions / Opt-Out Form */}
            {children && (
              <div className="w-full flex justify-center">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
