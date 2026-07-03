import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About QSO Dates | Amateur Radio Activity Calendar",
  description:
    "QSODates.com is a free, open, community-driven platform for amateur radio operators to discover, share, and promote ham radio activities worldwide.",
  path: "/about",
});

const COMMITMENTS = [
  "Free access to amateur radio activity information.",
  "Open and reusable community-contributed event data.",
  "Free public APIs for developers and organizations.",
  "Respect for contributors and users.",
  "Transparency in how information is managed.",
  "Long-term preservation of amateur radio activity information.",
  "Supporting amateur radio operators worldwide.",
];

export default function AboutPage() {
  return (
    <LegalPageShell title="About QSODates.com" currentPath="/about">
      <p>
        QSODates.com is a free, open, community-driven platform for amateur radio operators, clubs,
        organizations, and event coordinators. Our goal is to help people discover, share, and promote
        amateur radio activities around the world.
      </p>
      <p>
        Whether it is a contest, special event station, field day, POTA activation, SOTA activation,
        club meeting, training session, net, award program, DXpedition, convention, hamfest, or any
        other amateur radio activity, QSODates.com gives the community a central place to publish and
        find event information.
      </p>
      <p>
        Amateur radio is built on cooperation, experimentation, learning, and public service. Yet event
        information is often scattered across websites, social media, newsletters, and club pages.
        QSODates.com exists to make that information easier to access, share, and preserve.
      </p>
      <p>
        QSODates.com is committed to open data. We aim to make community-contributed event information
        available through our website and public APIs so that developers, clubs, researchers, and other
        amateur radio services can build useful tools and services.
      </p>
      <p>
        We are an independent community project. We are not affiliated with, endorsed by, or operated by
        any national amateur radio society, regulatory authority, manufacturer, commercial organization,
        or club unless explicitly stated.
      </p>

      <h2>Our Commitment</h2>
      <p>We are committed to:</p>
      <ul>
        {COMMITMENTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Join The Community</h2>
      <p>
        If you are an operator, club officer, event organizer, software developer, researcher, or amateur
        radio enthusiast, we invite you to participate. Submit events, share activities, build applications
        using our APIs, and help create a more connected amateur radio calendar.
      </p>
    </LegalPageShell>
  );
}
