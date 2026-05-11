import { OlympicAthlete, ParalympicAthlete } from "./utils/fuzzyMatch";

export const SAMPLE_OLYMPIC_DATA: OlympicAthlete[] = [
  { name: "Michael Phelps", hometown: "Baltimore, MD", sport: "Swimming", year: 2016 },
  { name: "Simone Biles", hometown: "Spring, TX", sport: "Gymnastics", year: 2016 },
  { name: "Allyson Felix", hometown: "Los Angeles", sport: "Athletics", year: 2016 },
  { name: "Adeline Gray", hometown: "Colorado Springs", sport: "Wrestling", year: 2016 },
  { name: "Connor Fields", hometown: "Henderson, NV", sport: "Cycling", year: 2016 },
];

export const SAMPLE_PARALYMPIC_DATA: ParalympicAthlete[] = [
  { name: "Mic Phelps", home_town: "Baltimore", sport_class: "S6", year: 2016 },
  { name: "Sim Biles", home_town: "Spring, Texas", sport_class: "G1", year: 2016 },
  { name: "Al Felix", home_town: "L.A.", sport_class: "T12", year: 2016 },
  { name: "Adeline G.", home_town: "Colo Spgs", sport_class: "W1", year: 2016 },
  { name: "Tatyana McFadden", home_town: "Clarksville, MD", sport_class: "T54", year: 2016 },
];
