export type TeamMember = Readonly<{
  name: string;
  title: string;
  image: `/team/${string}.jpg`;
  linkedin: `https://www.linkedin.com/in/${string}/`;
}>;

export const teamMembers = [
  {
    name: "Shay Livnat",
    title: "Chairman",
    image: "/team/shay-livnat.jpg",
    linkedin: "https://www.linkedin.com/in/shay-livnat-73193/",
  },
  {
    name: "Liav Ben Rubi",
    title: "CEO",
    image: "/team/liav-ben-rubi.jpg",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
  },
  {
    name: "Dana Taigman Koren",
    title: "CBO",
    image: "/team/dana-taigman-koren.jpg",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
  },
  {
    name: "Dalia Damary",
    title: "CFO",
    image: "/team/dalia-damary.jpg",
    linkedin: "https://www.linkedin.com/in/dalia-damary-4964271a5/",
  },
  {
    name: "Neta Fuchs",
    title: "Automotive & Logistics Domain Manager",
    image: "/team/neta-fuchs.jpg",
    linkedin: "https://www.linkedin.com/in/neta-fuchs-3702163b0/",
  },
  {
    name: "Din Shalit",
    title: "Industry 4.0, Energy & Defense Domain Manager",
    image: "/team/din-shalit.jpg",
    linkedin: "https://www.linkedin.com/in/din-shalit-405267173/",
  },
  {
    name: "Yuval Asayag",
    title: "Operations & Marketing Lead",
    image: "/team/yuval-asayag.jpg",
    linkedin: "https://www.linkedin.com/in/yuval-asayag/",
  },
  {
    name: "Oz Dekel",
    title: "Junior Full Stack Developer",
    image: "/team/oz-dekel.jpg",
    linkedin: "https://www.linkedin.com/in/oz-dekel-789ab326a/",
  },
  {
    name: "Yael Silberbusch",
    title: "Office Manager",
    image: "/team/yael-silberbusch.jpg",
    linkedin: "https://www.linkedin.com/in/yael-silberbusch-44a1723a4/",
  },
  {
    name: "Evyatar Ben-Ishay",
    title: "POC Center Manager",
    image: "/team/evyatar-ben-ishay.jpg",
    linkedin: "https://www.linkedin.com/in/evyatar-ben-ishay-1a8b60138/",
  },
] as const satisfies readonly TeamMember[];
