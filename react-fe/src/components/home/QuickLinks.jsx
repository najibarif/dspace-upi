import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAuthors,
  getOpenAlexWorks,
  getOrganizations,
} from "../../utils/api";

const items = [
  { label: "Profiles", href: "/profiles", icon: "person" },
  { label: "Home", href: "/", icon: "home" },
  { label: "Organization", href: "/organization", icon: "group" },
  { label: "Paper", href: "/paper", icon: "description" },
  { label: "Project", href: "/project", icon: "donut_large" },
  { label: "Patent", href: "/patent", icon: "gavel" },
  { label: "Outreach", href: "/outreach", icon: "public" },
  { label: "Thesis", href: "/thesis", icon: "web_stories" },
  { label: "Equipment", href: "/equipment", icon: "settings" },
];

export default function QuickLinks() {
  const [counts, setCounts] = useState({
    profiles: null,
    papers: null,
    organizations: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [authorsRes, worksRes, orgsRes] = await Promise.all([
          getAuthors({ page: 1, perPage: 1 }),
          getOpenAlexWorks({ page: 1, perPage: 1 }),
          getOrganizations(),
        ]);

        const profiles = Number(authorsRes?.meta?.count ?? 0) || 0;
        const papers = Number(worksRes?.meta?.count ?? 0) || 0;
        const organizations = Array.isArray(orgsRes)
          ? orgsRes.length
          : Number(orgsRes?.meta?.count ?? 0) || null;

        if (isMounted) setCounts({ profiles, papers, organizations });
      } catch (_) {
        if (isMounted) setCounts((prev) => ({ ...prev }));
      }
    };
    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const getBadge = (label) => {
    switch (label) {
      case "Profiles":
        return counts.profiles;
      case "Paper":
        return counts.papers;
      case "Organization":
        return counts.organizations;
      default:
        return null;
    }
  };

  return (
    <section className='px-6 md:px-24'>
      <div className='max-w-7xl mx-auto border-t-2 border-b-2 border-gray-300'>
        <div className='py-1' />
        <div className='w-full flex justify-center'>
          <div className='grid grid-cols-3 md:grid-cols-9 gap-6 md:gap-8 py-6'>
            {items.map((it) => {
              const badge = getBadge(it.label);
              return (
                <Link
                  key={it.label}
                  to={it.href}
                  className='group flex flex-col items-center w-24 md:w-28'
                >
                  <div className='relative flex items-center justify-center h-12'>
                    <span className='material-symbols-outlined text-4xl text-gray-800'>
                      {it.icon}
                    </span>
                    {badge != null && (
                      <span className='absolute -right-4 top-1 h-4 px-2 rounded bg-gray-200 text-[10px] text-gray-700'>
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className='mt-2 text-xs md:text-sm text-gray-700 text-center'>
                    {it.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
