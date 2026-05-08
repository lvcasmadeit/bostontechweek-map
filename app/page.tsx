import { BostonTechWeekApp } from "@/src/components/BostonTechWeekApp";
import { getBostonTechWeekEvents } from "@/src/lib/tech-week-events";

export default async function Home() {
  const events = await getBostonTechWeekEvents();

  return <BostonTechWeekApp initialEvents={events} />;
}
