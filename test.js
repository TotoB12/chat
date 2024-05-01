const nodeIcal = require("node-ical");

async function get_calendar(input) {
  try {
    const icalUrl =
      "https://pronote.rochambeau.org/ical/Edt.ics?icalsecurise=88A316BD1DEF6A182BB032BC12966EEF3E93B0D66C78363DBB5170D51949E1D0890359EE82E0E300D2254C2E61DC5B55&version=2023.0.2.8&param=66683d31";
    nodeIcal.fromURL(icalUrl, {}, (err, data) => {
      if (err) {
        console.error("Failed to fetch iCal data:", err);
        return;
      }
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const events = Object.values(data).filter((e) => e.type === "VEVENT");
      const upcomingEvents = events.filter((event) => {
        const eventStart = new Date(event.start);
        return eventStart >= today && eventStart <= nextWeek;
      });

      console.log(upcomingEvents);
    });
  } catch (error) {
    console.log(error);
  }
}

get_calendar();
